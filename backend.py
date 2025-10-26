"""
Rift Rewind - League of Legends Year-in-Review AI Agent
Uses AWS Bedrock and Riot API to generate personalized player insights
"""

import os
import json
import time
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import requests
import boto3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class RiotAPIClient:
    """Client for interacting with Riot Games API"""

    # Riot API endpoints by region
    REGIONS = {
        'na1': 'https://na1.api.riotgames.com',
        'euw1': 'https://euw1.api.riotgames.com',
        'kr': 'https://kr.api.riotgames.com',
        'br1': 'https://br1.api.riotgames.com',
    }

    REGIONAL_ENDPOINTS = {
        'americas': 'https://americas.api.riotgames.com',
        'europe': 'https://europe.api.riotgames.com',
        'asia': 'https://asia.api.riotgames.com',
    }

    def __init__(self, api_key: str, region: str = 'na1'):
        self.api_key = api_key
        self.region = region
        self.base_url = self.REGIONS.get(region, self.REGIONS['na1'])

        # Map platform to regional routing
        self.regional_url = self._get_regional_endpoint(region)

    def _get_regional_endpoint(self, platform: str) -> str:
        """Map platform to regional routing endpoint"""
        if platform in ['na1', 'br1', 'la1', 'la2']:
            return self.REGIONAL_ENDPOINTS['americas']
        elif platform in ['euw1', 'eun1', 'tr1', 'ru']:
            return self.REGIONAL_ENDPOINTS['europe']
        else:
            return self.REGIONAL_ENDPOINTS['asia']

    def _make_request(self, url: str) -> Optional[Dict]:
        """Make API request with rate limiting and error handling"""
        headers = {'X-Riot-Token': self.api_key}

        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                # Rate limited - wait and retry
                retry_after = int(response.headers.get('Retry-After', 1))
                print(f"Rate limited. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                return self._make_request(url)
            else:
                print(f"Error {response.status_code}: {response.text}")
                return None

        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def get_account_by_riot_id(self, game_name: str, tag_line: str) -> Optional[Dict]:
        """Get account information by Riot ID (gameName#tagLine)"""
        # Use regional endpoint for account API
        url = f"{self.regional_url}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        return self._make_request(url)

    def get_summoner_by_puuid(self, puuid: str) -> Optional[Dict]:
        """Get summoner information by PUUID"""
        url = f"{self.base_url}/lol/summoner/v4/summoners/by-puuid/{puuid}"
        return self._make_request(url)

    def get_summoner_by_riot_id(self, riot_id: str) -> Optional[Dict]:
        """Get summoner information by Riot ID (gameName#tagLine)

        Args:
            riot_id: Riot ID in format 'GameName#TAG' (e.g., 'Doublelift#NA1')

        Returns:
            Summoner data including puuid, summonerLevel, etc.
        """
        # Split Riot ID into game name and tag
        if '#' not in riot_id:
            print(f"Invalid Riot ID format. Please use format: GameName#TAG (e.g., Doublelift#NA1)")
            return None

        game_name, tag_line = riot_id.split('#', 1)

        # First get account info (includes puuid)
        account = self.get_account_by_riot_id(game_name, tag_line)
        if not account:
            return None

        puuid = account['puuid']

        # Then get summoner info using puuid
        summoner = self.get_summoner_by_puuid(puuid)
        if summoner:
            # Add game name and tag to summoner data
            summoner['gameName'] = account['gameName']
            summoner['tagLine'] = account['tagLine']

        return summoner

    def get_match_history(self, puuid: str, count: int = 100, start_time: Optional[int] = None, start: int = 0) -> Optional[List[str]]:
        """Get match IDs for a player

        Args:
            puuid: Player Universal Unique Identifier
            count: Number of matches to retrieve (max 100 per request)
            start_time: Epoch timestamp in seconds (filter matches after this time)
            start: Pagination offset (0-indexed)
        """
        url = f"{self.regional_url}/lol/match/v5/matches/by-puuid/{puuid}/ids?count={count}&start={start}"

        if start_time:
            url += f"&startTime={start_time}"

        return self._make_request(url)

    def get_match_details(self, match_id: str) -> Optional[Dict]:
        """Get detailed match information"""
        url = f"{self.regional_url}/lol/match/v5/matches/{match_id}"
        return self._make_request(url)

    def get_full_year_matches(self, puuid: str) -> List[Dict]:
        """Get all matches from the past year for a player"""
        # Calculate timestamp for 1 year ago
        one_year_ago = int((datetime.now() - timedelta(days=365)).timestamp())

        all_matches = []
        start_index = 0
        batch_size = 100

        print(f"Fetching matches from the past year...")

        while True:
            # Get match IDs with pagination
            match_ids = self.get_match_history(
                puuid=puuid,
                count=batch_size,
                start_time=one_year_ago,
                start=start_index
            )

            if not match_ids:
                break

            print(f"Fetched {len(match_ids)} match IDs. Retrieving details...")

            # Get details for each match
            for match_id in match_ids:
                match_data = self.get_match_details(match_id)
                if match_data:
                    all_matches.append(match_data)
                time.sleep(0.1)  # Small delay to avoid rate limiting

            # If we got fewer than batch_size, we've reached the end
            if len(match_ids) < batch_size:
                break

            start_index += batch_size

        print(f"Total matches retrieved: {len(all_matches)}")
        return all_matches


class AWSBedrockClient:
    """Client for interacting with AWS Bedrock AI models"""

    def __init__(self, region: str = 'us-east-1', model_id: str = None):
        self.region = region
        self.model_id = model_id or os.getenv('BEDROCK_MODEL_ID', 'us.anthropic.claude-3-5-sonnet-20241022-v2:0')

        # Initialize Bedrock client
        self.client = boto3.client(
            service_name='bedrock-runtime',
            region_name=region,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )

    def generate_insights(self, prompt: str, max_tokens: int = 4096) -> str:
        """Generate AI insights using Claude via Bedrock"""

        # Prepare request body for Claude
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7
        }

        try:
            # Invoke the model
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(request_body)
            )

            # Parse response
            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']

        except Exception as e:
            print(f"Bedrock API error: {e}")
            return f"Error generating insights: {e}"


class MatchDataProcessor:
    """Process Riot API match data into analytics"""

    @staticmethod
    def extract_player_stats(matches: List[Dict], puuid: str) -> Dict:
        """Extract comprehensive statistics from match history"""

        stats = {
            'total_matches': len(matches),
            'wins': 0,
            'losses': 0,
            'total_kills': 0,
            'total_deaths': 0,
            'total_assists': 0,
            'total_gold': 0,
            'total_damage': 0,
            'champions_played': {},
            'roles_played': {},
            'best_champion': None,
            'longest_game': 0,
            'shortest_game': float('inf'),
            'pentakills': 0,
            'quadrakills': 0,
            'first_bloods': 0,
            'match_history_by_month': {},
        }

        for match in matches:
            # Find player's participant data
            participant = None
            for p in match['info']['participants']:
                if p['puuid'] == puuid:
                    participant = p
                    break

            if not participant:
                continue

            # Win/Loss
            if participant['win']:
                stats['wins'] += 1
            else:
                stats['losses'] += 1

            # KDA stats
            stats['total_kills'] += participant['kills']
            stats['total_deaths'] += participant['deaths']
            stats['total_assists'] += participant['assists']

            # Other stats
            stats['total_gold'] += participant['goldEarned']
            stats['total_damage'] += participant['totalDamageDealtToChampions']

            # Champion tracking
            champion = participant['championName']
            if champion not in stats['champions_played']:
                stats['champions_played'][champion] = {
                    'games': 0,
                    'wins': 0,
                    'kills': 0,
                    'deaths': 0,
                    'assists': 0
                }

            stats['champions_played'][champion]['games'] += 1
            if participant['win']:
                stats['champions_played'][champion]['wins'] += 1
            stats['champions_played'][champion]['kills'] += participant['kills']
            stats['champions_played'][champion]['deaths'] += participant['deaths']
            stats['champions_played'][champion]['assists'] += participant['assists']

            # Role tracking
            role = participant.get('teamPosition', 'UNKNOWN')
            stats['roles_played'][role] = stats['roles_played'].get(role, 0) + 1

            # Game duration
            duration = match['info']['gameDuration']
            stats['longest_game'] = max(stats['longest_game'], duration)
            stats['shortest_game'] = min(stats['shortest_game'], duration)

            # Special achievements
            stats['pentakills'] += participant.get('pentaKills', 0)
            stats['quadrakills'] += participant.get('quadraKills', 0)
            if participant.get('firstBloodKill', False):
                stats['first_bloods'] += 1

            # Monthly breakdown
            timestamp = match['info']['gameCreation']
            month = datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m')
            stats['match_history_by_month'][month] = stats['match_history_by_month'].get(month, 0) + 1

        # Calculate averages and best champion
        if stats['total_matches'] > 0:
            stats['avg_kills'] = stats['total_kills'] / stats['total_matches']
            stats['avg_deaths'] = stats['total_deaths'] / stats['total_matches']
            stats['avg_assists'] = stats['total_assists'] / stats['total_matches']
            stats['win_rate'] = (stats['wins'] / stats['total_matches']) * 100

            # Find best champion by win rate (min 5 games)
            best_wr = 0
            for champ, data in stats['champions_played'].items():
                if data['games'] >= 5:
                    wr = (data['wins'] / data['games']) * 100
                    if wr > best_wr:
                        best_wr = wr
                        stats['best_champion'] = {
                            'name': champ,
                            'win_rate': wr,
                            'games': data['games']
                        }

        return stats


class InsightGenerator:
    """Generate personalized insights using AI"""

    @staticmethod
    def create_year_in_review_prompt(stats: Dict, summoner_name: str) -> str:
        """Create a comprehensive prompt for year-in-review insights"""

        prompt = f"""You are an expert League of Legends analyst creating a personalized end-of-year recap for {summoner_name}.

Here is their complete year statistics:

OVERALL PERFORMANCE:
- Total Matches: {stats['total_matches']}
- Win Rate: {stats.get('win_rate', 0):.1f}% ({stats['wins']} wins, {stats['losses']} losses)
- Average KDA: {stats.get('avg_kills', 0):.1f} / {stats.get('avg_deaths', 0):.1f} / {stats.get('avg_assists', 0):.1f}

CHAMPIONS PLAYED:
{json.dumps(stats['champions_played'], indent=2)}

ROLES PLAYED:
{json.dumps(stats['roles_played'], indent=2)}

ACHIEVEMENTS:
- Pentakills: {stats['pentakills']}
- Quadrakills: {stats['quadrakills']}
- First Bloods: {stats['first_bloods']}

GAME TIMES:
- Longest Game: {stats['longest_game'] // 60} minutes
- Shortest Game: {stats['shortest_game'] // 60} minutes

MONTHLY ACTIVITY:
{json.dumps(stats['match_history_by_month'], indent=2)}

Generate a comprehensive, engaging, and personalized year-in-review for this player that includes:

1. **Headline Achievement**: Start with their most impressive stat or achievement
2. **Playing Style Analysis**: What their champion picks and stats say about their playstyle
3. **Growth Moments**: Identify positive trends or improvements
4. **Surprising Insights**: Interesting patterns they might not have noticed
5. **Areas for Improvement**: Constructive feedback on growth opportunities
6. **Memorable Moments**: Highlight their best performances
7. **Looking Forward**: Motivational goals for next year

Make it personal, encouraging, and fun to read. Use gaming terminology and be specific with their actual stats. Format it in an engaging way with sections and emoji where appropriate."""

        return prompt


def main():
    """Main function to run the Rift Rewind agent"""

    # Load configuration
    riot_api_key = os.getenv('RIOT_API_KEY')
    aws_region = os.getenv('AWS_REGION', 'us-east-1')

    if not riot_api_key:
        print("Error: RIOT_API_KEY not found in environment variables")
        print("Please copy .env.template to .env and add your API key")
        return

    # Initialize clients
    print("Initializing clients...")
    riot_client = RiotAPIClient(api_key=riot_api_key, region='na1')
    bedrock_client = AWSBedrockClient(region=aws_region)

    # Get summoner information using Riot ID
    print("\nRiot ID format: GameName#TAG (e.g., Doublelift#NA1)")
    print("To find your Riot ID, check your League client profile")
    riot_id = input("Enter Riot ID: ")
    print(f"\nFetching data for {riot_id}...")

    summoner = riot_client.get_summoner_by_riot_id(riot_id)
    if not summoner:
        print("Summoner not found!")
        print("Make sure you're using the correct format: GameName#TAG")
        return

    puuid = summoner['puuid']
    display_name = f"{summoner['gameName']}#{summoner['tagLine']}"
    print(f"Found summoner: {display_name} (Level {summoner['summonerLevel']})")

    # Get match history
    print("\nFetching match history (this may take a few minutes)...")
    matches = riot_client.get_full_year_matches(puuid)

    if not matches:
        print("No matches found for this player in the past year!")
        return

    # Process match data
    print("\nProcessing match data...")
    stats = MatchDataProcessor.extract_player_stats(matches, puuid)

    # Generate AI insights
    print("\nGenerating AI-powered insights...")
    prompt = InsightGenerator.create_year_in_review_prompt(stats, display_name)
    insights = bedrock_client.generate_insights(prompt)

    # Display results
    print("\n" + "="*80)
    print(f" RIFT REWIND: {display_name}'s 2024 Year in Review")
    print("="*80 + "\n")
    print(insights)
    print("\n" + "="*80)

    # Optionally save to file
    save = input("\nSave this recap to a file? (y/n): ")
    if save.lower() == 'y':
        filename = f"{summoner['gameName']}_year_in_review_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"RIFT REWIND: {display_name}'s 2024 Year in Review\n")
            f.write("="*80 + "\n\n")
            f.write(insights)
        print(f"Saved to {filename}")


if __name__ == "__main__":
    main()

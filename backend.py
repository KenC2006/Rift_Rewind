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
    
    def get_ranked_info(self, summoner_id: str) -> Optional[List[Dict]]:
        """Get ranked information for a summoner
        
        Args:
            summoner_id: Encrypted summoner ID
            
        Returns:
            List of ranked entries (one per queue type)
        """
        url = f"{self.base_url}/lol/league/v4/entries/by-summoner/{summoner_id}"
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
            'total_cs': 0,  # Total creep score
            'total_vision_score': 0,
            'total_damage_taken': 0,
            'total_healing': 0,
            'total_game_duration': 0,  # For per-minute calculations
            'control_wards_purchased': 0,
            'wards_placed': 0,
            'wards_killed': 0,
            'total_objectives': 0,
            'solo_kills': 0,
            'champions_played': {},
            'roles_played': {},
            'best_champion': None,
            'longest_game': 0,
            'shortest_game': float('inf'),
            'pentakills': 0,
            'quadrakills': 0,
            'first_bloods': 0,
            'match_history_by_month': {},
            'early_game_cs': [],  # CS at 10 minutes for each game
            'damage_share': [],  # Percent of team's damage
            'gold_share': [],  # Percent of team's gold
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
            
            # CS and farming stats
            total_minions = participant.get('totalMinionsKilled', 0) + participant.get('neutralMinionsKilled', 0)
            stats['total_cs'] += total_minions
            
            # Vision and map control
            stats['total_vision_score'] += participant.get('visionScore', 0)
            stats['control_wards_purchased'] += participant.get('detectorWardsPlaced', 0)
            stats['wards_placed'] += participant.get('wardsPlaced', 0)
            stats['wards_killed'] += participant.get('wardsKilled', 0)
            
            # Combat stats
            stats['total_damage_taken'] += participant.get('totalDamageTaken', 0)
            stats['total_healing'] += participant.get('totalHealsOnTeammates', 0)
            stats['solo_kills'] += participant.get('soloKills', 0)
            
            # Objective participation (detailed tracking for macro analysis)
            stats['total_objectives'] += (
                participant.get('damageDealtToObjectives', 0) +
                participant.get('damageDealtToTurrets', 0)
            ) / 10000  # Normalize large numbers
            
            # Specific objective stats for macro advice
            if 'dragonKills' not in stats:
                stats['dragonKills'] = 0
                stats['baronKills'] = 0
                stats['turretKills'] = 0
                stats['turretTakedowns'] = 0
                stats['inhibitorKills'] = 0
                stats['inhibitorTakedowns'] = 0
            
            stats['dragonKills'] += participant.get('dragonKills', 0)
            stats['baronKills'] += participant.get('baronKills', 0)
            stats['turretKills'] += participant.get('turretKills', 0)
            stats['turretTakedowns'] += participant.get('turretTakedowns', 0)
            stats['inhibitorKills'] += participant.get('inhibitorKills', 0)
            stats['inhibitorTakedowns'] += participant.get('inhibitorTakedowns', 0)
            
            # Game duration for per-minute calculations
            duration = match['info']['gameDuration']
            stats['total_game_duration'] += duration
            
            # Early game CS (if timeline data available)
            # Note: Riot API doesn't provide CS at specific timestamps in match data
            # We'll estimate: if game > 10 min, store avg CS/min * 10
            if duration >= 600:  # 10 minutes
                estimated_cs_10 = (total_minions / (duration / 60)) * 10
                stats['early_game_cs'].append(estimated_cs_10)
            
            # Team stats for share calculation
            team_id = participant['teamId']
            team_damage = sum(p['totalDamageDealtToChampions'] for p in match['info']['participants'] if p['teamId'] == team_id)
            team_gold = sum(p['goldEarned'] for p in match['info']['participants'] if p['teamId'] == team_id)
            
            if team_damage > 0:
                stats['damage_share'].append((participant['totalDamageDealtToChampions'] / team_damage) * 100)
            if team_gold > 0:
                stats['gold_share'].append((participant['goldEarned'] / team_gold) * 100)

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
            stats['champions_played'][champion]['cs'] = stats['champions_played'][champion].get('cs', 0) + total_minions

            # Role tracking
            role = participant.get('teamPosition', 'UNKNOWN')
            # Normalize role: ignore empty/invalid roles
            if role and role.strip() and role != 'UNKNOWN':
                stats['roles_played'][role] = stats['roles_played'].get(role, 0) + 1
            else:
                # Fallback: try to infer role from champion (common patterns)
                champion = participant['championName']
                # Very basic inference - could be expanded
                if champion in ['Janna', 'Soraka', 'Lulu', 'Thresh', 'Blitzcrank', 'Leona', 'Nautilus', 'Braum']:
                    stats['roles_played']['UTILITY'] = stats['roles_played'].get('UTILITY', 0) + 1
                elif champion in ['Lee Sin', 'Elise', 'Graves', 'Kha\'Zix', 'Rek\'Sai', 'Nidalee', 'Kindred']:
                    stats['roles_played']['JUNGLE'] = stats['roles_played'].get('JUNGLE', 0) + 1
                # Otherwise don't count it

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
            
            # CS and farming averages
            stats['avg_cs'] = stats['total_cs'] / stats['total_matches']
            total_hours = stats['total_game_duration'] / 3600
            if total_hours > 0:
                stats['cs_per_min'] = stats['total_cs'] / (stats['total_game_duration'] / 60)
                stats['gold_per_min'] = stats['total_gold'] / (stats['total_game_duration'] / 60)
                stats['damage_per_min'] = stats['total_damage'] / (stats['total_game_duration'] / 60)
            
            # Vision and map control averages
            stats['avg_vision_score'] = stats['total_vision_score'] / stats['total_matches']
            stats['avg_control_wards'] = stats['control_wards_purchased'] / stats['total_matches']
            stats['avg_wards_placed'] = stats['wards_placed'] / stats['total_matches']
            stats['avg_wards_killed'] = stats['wards_killed'] / stats['total_matches']
            
            # Combat averages
            stats['avg_damage_taken'] = stats['total_damage_taken'] / stats['total_matches']
            
            # Calculate KDA ratio
            if stats['avg_deaths'] > 0:
                stats['kda_ratio'] = (stats['avg_kills'] + stats['avg_assists']) / stats['avg_deaths']
            else:
                stats['kda_ratio'] = stats['avg_kills'] + stats['avg_assists']
            
            # Kill participation (approximation based on average)
            stats['avg_kill_participation'] = ((stats['total_kills'] + stats['total_assists']) / stats['total_matches']) / 25 * 100  # Assuming ~25 kills per team per game
            
            # Early game performance
            if stats['early_game_cs']:
                stats['avg_cs_at_10'] = sum(stats['early_game_cs']) / len(stats['early_game_cs'])
            
            # Team contribution
            if stats['damage_share']:
                stats['avg_damage_share'] = sum(stats['damage_share']) / len(stats['damage_share'])
            if stats['gold_share']:
                stats['avg_gold_share'] = sum(stats['gold_share']) / len(stats['gold_share'])
            
            # Calculate objective averages for macro analysis
            if stats['total_matches'] > 0:
                stats['avg_dragons'] = stats.get('dragonKills', 0) / stats['total_matches']
                stats['avg_barons'] = stats.get('baronKills', 0) / stats['total_matches']
                stats['avg_turrets'] = stats.get('turretTakedowns', 0) / stats['total_matches']
                stats['avg_inhibitors'] = stats.get('inhibitorTakedowns', 0) / stats['total_matches']
            
            # Determine primary role
            if stats['roles_played']:
                # Filter out invalid roles
                valid_roles = {k: v for k, v in stats['roles_played'].items() if k and k.strip() and k != 'UNKNOWN'}
                if valid_roles:
                    stats['primary_role'] = max(valid_roles, key=valid_roles.get)
                else:
                    # Fallback: infer from champion pool
                    stats['primary_role'] = 'MIDDLE'  # Safe default
            else:
                stats['primary_role'] = 'MIDDLE'  # Safe default

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


class PerformanceBenchmarks:
    """Role and elo-specific performance benchmarks"""
    
    # CS per minute benchmarks by role and elo
    CS_BENCHMARKS = {
        'TOP': {
            'IRON': 4.5, 'BRONZE': 5.0, 'SILVER': 5.5, 'GOLD': 6.0, 
            'PLATINUM': 6.5, 'EMERALD': 7.0, 'DIAMOND': 7.5, 'MASTER+': 8.0
        },
        'JUNGLE': {
            'IRON': 3.0, 'BRONZE': 3.5, 'SILVER': 4.0, 'GOLD': 4.5,
            'PLATINUM': 5.0, 'EMERALD': 5.5, 'DIAMOND': 6.0, 'MASTER+': 6.5
        },
        'MIDDLE': {
            'IRON': 4.5, 'BRONZE': 5.0, 'SILVER': 5.5, 'GOLD': 6.0,
            'PLATINUM': 6.5, 'EMERALD': 7.0, 'DIAMOND': 7.5, 'MASTER+': 8.5
        },
        'BOTTOM': {
            'IRON': 4.5, 'BRONZE': 5.0, 'SILVER': 5.5, 'GOLD': 6.5,
            'PLATINUM': 7.0, 'EMERALD': 7.5, 'DIAMOND': 8.0, 'MASTER+': 9.0
        },
        'UTILITY': {
            'IRON': 1.0, 'BRONZE': 1.2, 'SILVER': 1.5, 'GOLD': 1.8,
            'PLATINUM': 2.0, 'EMERALD': 2.2, 'DIAMOND': 2.5, 'MASTER+': 2.8
        }
    }
    
    # Vision score per minute benchmarks
    VISION_BENCHMARKS = {
        'TOP': {'IRON': 0.5, 'BRONZE': 0.6, 'SILVER': 0.8, 'GOLD': 1.0, 'PLATINUM': 1.2, 'EMERALD': 1.4, 'DIAMOND': 1.6, 'MASTER+': 1.8},
        'JUNGLE': {'IRON': 0.8, 'BRONZE': 1.0, 'SILVER': 1.2, 'GOLD': 1.5, 'PLATINUM': 1.8, 'EMERALD': 2.0, 'DIAMOND': 2.2, 'MASTER+': 2.5},
        'MIDDLE': {'IRON': 0.5, 'BRONZE': 0.6, 'SILVER': 0.8, 'GOLD': 1.0, 'PLATINUM': 1.2, 'EMERALD': 1.4, 'DIAMOND': 1.6, 'MASTER+': 1.8},
        'BOTTOM': {'IRON': 0.6, 'BRONZE': 0.8, 'SILVER': 1.0, 'GOLD': 1.2, 'PLATINUM': 1.4, 'EMERALD': 1.6, 'DIAMOND': 1.8, 'MASTER+': 2.0},
        'UTILITY': {'IRON': 2.0, 'BRONZE': 2.5, 'SILVER': 3.0, 'GOLD': 3.5, 'PLATINUM': 4.0, 'EMERALD': 4.5, 'DIAMOND': 5.0, 'MASTER+': 5.5}
    }
    
    # KDA benchmarks
    KDA_BENCHMARKS = {
        'IRON': 2.0, 'BRONZE': 2.2, 'SILVER': 2.5, 'GOLD': 2.8,
        'PLATINUM': 3.0, 'EMERALD': 3.2, 'DIAMOND': 3.5, 'MASTER+': 4.0
    }
    
    @staticmethod
    def get_elo_tier(rank_info: Optional[Dict]) -> str:
        """Extract elo tier from rank info"""
        if not rank_info:
            return 'SILVER'  # Default assumption
        
        tier = rank_info.get('tier', 'SILVER')
        if tier in ['MASTER', 'GRANDMASTER', 'CHALLENGER']:
            return 'MASTER+'
        return tier
    
    @staticmethod
    def compare_to_benchmark(stat_value: float, benchmark: float) -> tuple:
        """Compare stat to benchmark and return (difference, percentage, assessment)"""
        diff = stat_value - benchmark
        if benchmark > 0:
            percent_diff = (diff / benchmark) * 100
        else:
            percent_diff = 0
        
        if percent_diff >= 10:
            assessment = "excellent"
        elif percent_diff >= 0:
            assessment = "good"
        elif percent_diff >= -15:
            assessment = "below_average"
        else:
            assessment = "needs_improvement"
        
        return (diff, percent_diff, assessment)


class InsightGenerator:
    """Generate personalized insights using AI"""

    @staticmethod
    def create_year_in_review_prompt(stats: Dict, summoner_name: str, rank_info: Optional[Dict] = None) -> str:
        """Create a comprehensive coaching-oriented prompt for year-in-review insights"""
        
        # Get player's primary role and estimated elo
        primary_role = stats.get('primary_role', 'UNKNOWN')
        
        # Handle blank/empty role - infer from champion pool or roles played
        if not primary_role or primary_role.strip() == '' or primary_role == 'UNKNOWN':
            # Try to infer from roles_played
            roles_played = stats.get('roles_played', {})
            if roles_played:
                # Remove empty/unknown roles
                valid_roles = {k: v for k, v in roles_played.items() if k and k.strip() and k != 'UNKNOWN'}
                if valid_roles:
                    primary_role = max(valid_roles, key=valid_roles.get)
                else:
                    # Fallback: analyze champion pool
                    primary_role = 'MIDDLE'  # Safe default for most champions
        
        elo = PerformanceBenchmarks.get_elo_tier(rank_info)
        
        # Get benchmarks for player's role and elo
        cs_benchmark = PerformanceBenchmarks.CS_BENCHMARKS.get(primary_role, {}).get(elo, 5.5)
        vision_benchmark = PerformanceBenchmarks.VISION_BENCHMARKS.get(primary_role, {}).get(elo, 1.0)
        kda_benchmark = PerformanceBenchmarks.KDA_BENCHMARKS.get(elo, 2.5)
        
        # Calculate player's performance vs benchmarks
        player_cs_per_min = stats.get('cs_per_min', 0)
        total_game_duration = max(stats.get('total_game_duration', 1), 1)  # Avoid division by zero
        total_matches = max(stats.get('total_matches', 1), 1)
        player_vision_per_min = stats.get('avg_vision_score', 0) / (total_game_duration / 60 / total_matches)
        player_kda = stats.get('kda_ratio', 0)
        
        # Check for missing critical metrics (but don't make Claude ask for them - work with what we have)
        missing_metrics = []
        has_limited_data = False
        if player_cs_per_min == 0 or stats.get('total_cs', 0) == 0:
            missing_metrics.append("CS data (will provide general farming advice)")
            has_limited_data = True
        if stats.get('avg_vision_score', 0) == 0:
            missing_metrics.append("Vision Score (will provide general vision advice)")
            has_limited_data = True
        
        # Build comprehensive analysis data (Note: Rank removed from display per user feedback - API inconsistencies)
        # We still use elo internally for benchmarks, but don't mention it to users

        prompt = f"""You are an ELITE League of Legends coach (think Caedrel, Coach Curtis, Bwipo, LS, etc.) providing a TRANSFORMATIVE performance analysis for {summoner_name}.

Your coaching philosophy: Data-driven, encouraging yet honest, actionable. Every piece of advice must answer: "What EXACTLY do I do tomorrow to improve?"

CRITICAL INSTRUCTIONS:
1. Work with the data provided. DO NOT ask the user for clarifications or missing data. If data is incomplete:
- Make reasonable inferences from available stats
- Focus analysis on metrics that ARE available
- Provide general advice for areas where specific data is missing
- Be confident in your analysis based on what you CAN see

2. DO NOT mention the player's rank or tell them what rank to reach (e.g., "reach Gold", "you're Silver"). Focus purely on skill improvement and performance metrics. The ranking system will take care of itself.

3. Keep language constructive and encouraging. Avoid punitive terms like "uninstall", "delete", "never play". Instead use "consider avoiding", "room for improvement", "focus on your strengths".

NEVER say "I need more information" or "Could you clarify". ALWAYS provide actionable coaching with available data.

═══════════════════════════════════════════════════════════════════════════
SECTION 1: PLAYER PROFILE & DATA QUALITY CHECK
═══════════════════════════════════════════════════════════════════════════

- Summoner: {summoner_name}
- Primary Role: {primary_role} ({stats.get('roles_played', {}).get(primary_role, 0)} games)
- Total Matches Analyzed: {stats['total_matches']}
- Sample Period: Past 12 months
- Win Rate: {(stats['wins'] / stats['total_matches'] * 100):.1f}% ({stats['wins']}W-{stats['losses']}L)

DATA QUALITY:
{f"⚠️ Note: Some metrics unavailable: {', '.join(missing_metrics)}" if missing_metrics else "✓ Complete data available"}

{"""
DATA LIMITATION: CS data is unavailable or incomplete. Analysis will focus on:
- KDA and combat patterns
- Champion pool optimization
- Vision control (if available)
- General macro/mental game advice

For more detailed farming analysis in the future, ensure match data includes minion kill counts.
""" if has_limited_data else ""}

═══════════════════════════════════════════════════════════════════════════
SECTION 2: PERFORMANCE METRICS & BENCHMARKS
═══════════════════════════════════════════════════════════════════════════

CRITICAL FARMING METRICS (Highest Impact on Climbing):

   CS/min: {player_cs_per_min:.1f} | Target for {primary_role}: {cs_benchmark:.1f} CS/min
   - Gap: {player_cs_per_min - cs_benchmark:+.1f} CS/min ({((player_cs_per_min / cs_benchmark - 1) * 100) if cs_benchmark > 0 else 0:+.0f}%)
   - CS at 10 min: {stats.get('avg_cs_at_10', 0):.1f} | Target: {cs_benchmark * 10:.0f}+ CS
   - Total CS: {stats.get('avg_cs', 0):.0f}/game | Gold/min: {stats.get('gold_per_min', 0):.0f}
   
   Assessment: {"✓ EXCELLENT - Maximize this advantage" if player_cs_per_min >= cs_benchmark * 1.1 else "✓ AT BENCHMARK - Maintain & refine" if player_cs_per_min >= cs_benchmark * 0.95 else "⚠️ BELOW TARGET - Primary improvement area (high impact)" if player_cs_per_min >= cs_benchmark * 0.85 else "🔴 CRITICAL GAP - Immediate focus required"}

COMBAT & SURVIVABILITY:
   KDA: {player_kda:.2f} | Target: {kda_benchmark:.1f}
   - K/D/A: {stats.get('avg_kills', 0):.1f} / {stats.get('avg_deaths', 0):.1f} / {stats.get('avg_assists', 0):.1f}
   - Damage/min: {stats.get('damage_per_min', 0):.0f} | Team damage share: {stats.get('avg_damage_share', 0):.1f}%
   - Solo kills: {stats.get('solo_kills', 0)} total
   
   DEATH ANALYSIS: {stats.get('avg_deaths', 0):.1f} deaths/game
   - Target: <{3.5 if elo in ['DIAMOND', 'MASTER+'] else 4.5 if elo in ['PLATINUM', 'EMERALD'] else 5.5} deaths/game
   - Impact: Every death = 20-30s not farming = ~15 CS = 450g lost
   
   Assessment: {"✓ EXCELLENT survivability & impact" if player_kda >= kda_benchmark * 1.2 else "✓ SOLID performance" if player_kda >= kda_benchmark else "⚠️ Too many deaths - position/vision issue" if stats.get('avg_deaths', 0) > 6 else "⚠️ Low impact - improve aggression/participation"}

VISION & MAP CONTROL:
   Vision/min: {player_vision_per_min:.2f} | Target for {primary_role}: {vision_benchmark:.1f}
   - Vision score/game: {stats.get('avg_vision_score', 0):.1f} | Target: {vision_benchmark * 30:.0f}+ (30min game)
   - Control wards/game: {stats.get('avg_control_wards', 0):.1f} | Target: {3.5 if primary_role == 'UTILITY' else 2.5}+
   - Wards placed: {stats.get('avg_wards_placed', 0):.1f}/game | Cleared: {stats.get('avg_wards_killed', 0):.1f}/game
   
   VISION PRIORITY BY ROLE:
   {f"- Support: CRITICAL (vision is your primary job, aim for 100+ vision score)"if primary_role == 'UTILITY' else f"- Jungle: HIGH (vision = objective control, aim for 50+ vision score)" if primary_role == 'JUNGLE' else f"- {primary_role}: MEDIUM (buy pinks every back, aim for 30-40 vision score)"}
   
   Assessment: {"✓ EXCELLENT vision control" if player_vision_per_min >= vision_benchmark * 1.1 else "✓ ADEQUATE vision" if player_vision_per_min >= vision_benchmark * 0.9 else "⚠️ LOW VISION - Buy control wards every back"}

MACRO & OBJECTIVE CONTROL:
   Objective Participation:
   - Dragons/game: {stats.get('avg_dragons', 0):.2f} | Barons/game: {stats.get('avg_barons', 0):.2f}
   - Turret Takedowns/game: {stats.get('avg_turrets', 0):.1f}
   - Inhibitor Takedowns/game: {stats.get('avg_inhibitors', 0):.2f}
   
   MACRO PRIORITY BY ROLE:
   {f"- Jungle: YOU control objectives. Track enemy jungle, secure every drake, call baron timers" if primary_role == 'JUNGLE' else f"- Support: Roam for drakes, deep ward for baron setup, engage/disengage fights" if primary_role == 'UTILITY' else f"- {primary_role}: Respond to objective pings, push waves before rotating, prioritize drakes over farm"}
   
   OBJECTIVE PRIORITY SYSTEM (General Guide):
   - TIER 1 (Always contest): Soul Drake, Baron Nashor, Game-ending inhibitor
   - TIER 2 (Usually contest): 3rd Drake, all Barons, inner turrets
   - TIER 3 (Trade available): 1st/2nd Drake (trade for Herald/turrets), outer turrets
   - TIER 4 (Skip if behind): Rift Herald, early drakes when enemy has comp advantage
   
   Assessment: {"✓ STRONG objective focus" if stats.get('avg_dragons', 0) > 0.7 else "⚠️ LOW objective participation - rotate faster to drakes/barons"}

WIN CONDITIONS & CONSISTENCY:
   - Win Rate: {stats.get('win_rate', 0):.1f}% ({stats['wins']}W-{stats['losses']}L)
   - Kill Participation: {stats.get('avg_kill_participation', 0):.1f}% | Target: {60 if primary_role in ['JUNGLE', 'UTILITY'] else 55 if primary_role == 'MIDDLE' else 50}%+
   - First Blood: {(stats.get('first_bloods', 0) / max(stats['total_matches'], 1) * 100):.1f}% of games
   - Best Champion: {stats.get('best_champion', {}).get('name', 'None')} ({stats.get('best_champion', {}).get('win_rate', 0):.1f}% WR, {stats.get('best_champion', {}).get('games', 0)} games)

CHAMPION POOL OVERVIEW:
{json.dumps({k: {**v, 'win_rate': f"{(v['wins']/v['games']*100):.1f}%" if v['games'] > 0 else '0%'} for k, v in list(stats['champions_played'].items())[:10]}, indent=2)}
... ({len(stats['champions_played'])} total champions played)

═══════════════════════════════════════════════════════════════════════════
SECTION 3: KEY IMPROVEMENT PRIORITIES
═══════════════════════════════════════════════════════════════════════════

{"""Focus areas: CS/Farming (★★★★★), Death Reduction (★★★★★), Wave Management (★★★★☆), Champion Pool Mastery (★★★★☆), Vision Control (★★★☆☆)
Key targets: 70+ CS at 10min, <5 deaths/game, 2-3 champion pool, 1 pink per back""" if elo in ['IRON', 'BRONZE', 'SILVER'] else """Focus areas: Wave Management (★★★★★), Mid-game Macro (★★★★★), CS Optimization (★★★★☆), Vision Denial (★★★★☆), Matchup Knowledge (★★★☆☆)
Key targets: 80+ CS at 10min, master freeze/slow push, 40+ vision score, catch 3+ side waves per game""" if elo in ['GOLD', 'PLATINUM', 'EMERALD'] else """Focus areas: Jungle Tracking (★★★★★), Recall Timer Abuse (★★★★★), Objective Trading (★★★★☆), Champion Mastery (★★★★☆), Macro Shotcalling (★★★☆☆)
Key targets: Track jungle 100% uptime, punish enemy backs for 500g leads, animation cancels, baron timings"""}

═══════════════════════════════════════════════════════════════════════════
YOUR COMPREHENSIVE COACHING ANALYSIS INSTRUCTIONS:
═══════════════════════════════════════════════════════════════════════════
Now provide a TRANSFORMATIVE coaching analysis following this exact structure:

1. EXECUTIVE SUMMARY
   - 2-3 sentence skill assessment with honesty and encouragement
   - Identify THE ONE thing holding them back from improving
   - State realistic 30-60-90 day improvement goals (focus on metrics, not rank)

2. STRENGTHS ANALYSIS 
   - List 2-3 metrics where they're at/above benchmark
   - For each: Explain game impact + how to leverage it MORE
   - Example: "6.2 KDA means you WIN trades. Use this to zone enemy off CS → get 10 CS leads → snowball"

3. CRITICAL IMPROVEMENT AREAS

   ACTIONABLE FIX (The 3-2-1 Method)
   3 Immediate Changes (today):
   1. [Specific mechanical change with numbers]
   2. [Specific decision-making rule]
   3. [Specific tracking/awareness habit]
   
   2 Practice Drills (this week):
   1. [Tool/custom game exercise with reps/duration]
   2. [In-game focused practice with success metric]
   
   1 VOD Review Focus (next 3 games):
   - [Specific thing to watch for in replay with timestamp guidance]
   
   If CS is an issue: Emphasize wave management (freeze to deny, slow push before roam, fast push to match rotations). Provide brief examples relevant to their role.

4. PRACTICE STRUCTURE

   Provide a clear weekly practice routine with specific drills:
   
   WEEK 1 - ISOLATED MECHANICS:
   - Daily warmup: 10 minutes practice tool, target 80+ CS with no abilities
   - Focus: Mouse accuracy and timing, not champion mechanics
   - Success metric: 3 consecutive days hitting 80+ CS
   
   WEEK 2-3 - IN-GAME APPLICATION:
   - Pre-game rule: {f"Check minimap after every 3rd CS" if elo in ['IRON', 'BRONZE', 'SILVER'] else f"Track enemy jungler constantly (vocalize position)" if elo in ['GOLD', 'PLATINUM', 'EMERALD'] else f"Know enemy recall timings within 5 seconds"}
   - Mandatory: Buy control ward EVERY back (no exceptions)
   - Strict rule: Push wave before ANY roam (if wave not pushed, stay in lane)
   - Track your CS at 10min each game (write it down)
   
   VOD REVIEW PROTOCOL:
   - After each session: Watch last game at 2x speed
   - Pause on 3 biggest mistakes
   - For each: Write down what you SHOULD have done + what visual cue you missed
   - Focus timestamps: 9-11min (CS at 10), 14-18min (mid-game side waves), every death (rewind 30s)
   
   This structure ensures deliberate practice, not autopilot grinding.

5. CHAMPION POOL OPTIMIZATION
   Analyze pool with 3 tiers:
   
   S-TIER (YOUR STRONGEST PICKS):
   - Identify top 2 champions by win rate from their champion pool
   - Show: Champion name, games played, win rate
   - Label as "YOUR MAIN" or "YOUR SECONDARY"
   - Recommendation: Play these 60-70% of your games for consistency
   - Why: Proven win rates show these work for your playstyle
   
   B-TIER (SITUATIONAL PICKS):
   - List next 3-5 champions by games played
   - Show: Champion name, games, win rate
   - Keep only if 50%+ win rate
   - Use when S-tier banned or for specific matchups/team needs
   
   C-TIER (IMPROVEMENT NEEDED):
   - Any champion with 5+ games and <45% win rate
   - Show: Champion name and exact win rate
   - Label as "NEEDS PRACTICE" or "CONSIDER AVOIDING for now"
   - These champions aren't working yet - revisit after mastering fundamentals
   - Optional: Suggest similar champions they perform better on (e.g., "Struggling on Yasuo? Try Yone - similar playstyle")
   
   Champion Pool Philosophy:
   Maintain 2-3 comfort picks while focusing extra practice on your highest win rate champion. Mastery beats variety.

6. ROLE-SPECIFIC MASTERY PATH: {primary_role}

   Core Responsibilities (in priority order):"""
   
        # Add role-specific responsibilities
        if primary_role in ['MIDDLE', 'BOTTOM']:
            prompt += """
   1. FARMING (priority #1) - You are a gold generator
   2. SCALING - Get to your 2-item spike ASAP  
   3. TEAMFIGHT POSITIONING - Don't die before dealing damage
   4. WAVE MANAGEMENT - Control recalls, deny enemy CS
   5. OBJECTIVE CALLS - Tell team when you have item spikes"""
        elif primary_role == 'TOP':
            prompt += """
   1. MAP PRESSURE - Push when your jungler is opposite side
   2. TP PLAYS - Arrive to fights with wave pushed
   3. SPLIT PUSH THREAT - Pull 2 enemies top → team gets obj
   4. FRONTLINE - Absorb damage in teamfights
   5. VISION CONTROL - Deep ward enemy jungle"""
        elif primary_role == 'JUNGLE':
            prompt += """
   1. OBJECTIVE CONTROL - Every drake/baron is YOUR call
   2. JUNGLE TRACKING - Know where enemy jungle is 24/7
   3. GANK EFFECTIVENESS - Quality > quantity (need 60%+ success rate)
   4. VISION DOMINANCE - Your pinks = your lanes' safety
   5. CARRY DIFF - Outfarm + outgank enemy jungle = gg"""
        else:  # UTILITY/Support
            prompt += """
   1. VISION CONTROL - Aim for 100+ vision score (your primary job)
   2. PEEL - Your carry's life > your life
   3. ENGAGE TIMING - Land 1 good engage = win fight
   4. ROAM TIMING - Roam when ADC is safe
   5. GOLD EFFICIENCY - Don't tax CS, maximize support item value"""
   
        prompt += """
   
   Common Mistakes to Avoid:"""
   
        # Add role-specific mistakes
        if primary_role in ['MIDDLE', 'TOP']:
            prompt += """
   - Roaming without pushing wave (lose 10+ CS per roam)
   - Not tracking enemy jungle (free deaths to ganks)"""
        elif primary_role == 'BOTTOM':
            prompt += """
   - Staying in lane too long (miss objective fights)
   - Not tracking enemy jungle (free deaths to ganks)"""
        elif primary_role == 'JUNGLE':
            prompt += """
   - Full clearing jungle while team loses objectives
   - Not tracking enemy lanes (waste time ganking pushed lanes)"""
        else:  # UTILITY
            prompt += """
   - Warding same spots repeatedly (enemy clears them)
   - Following ADC into danger (both die)"""
   
        if primary_role != 'UTILITY':
            prompt += """
   - Building same items every game (need adaptability)"""
        else:
            prompt += """
   - Rushing damage items instead of utility"""
   
        prompt += f"""
   
   Next-Level Technique to Master:"""
   
        # Add advanced technique by role
        if primary_role == 'TOP':
            prompt += """
   'The Cheater Recall' - Push wave level 3/4 → back → TP to lane with item advantage. This wins lane 70% of time because opponent doesn't respect TP timing."""
        elif primary_role == 'MIDDLE':
            prompt += """
   'Shadow Roaming' - Walk to river as if roaming, but if enemy doesn't follow, immediately return to catch wave. Forces enemy to choose between CS and map pressure."""
        elif primary_role == 'BOTTOM':
            prompt += """
   'The ADC Funnel' - After winning teamfight at 20+ min, take BOTH side waves while support holds mid. This hits your 3-item spike 3-4 minutes earlier = you 1v9."""
        elif primary_role == 'JUNGLE':
            prompt += """
   'The Vertical Jungle' - If you see enemy jungler top side, immediately invade their bottom side camps. Free gold + map control."""
        else:  # UTILITY
            prompt += """
   'The Vision Triangle' - Place 3 wards in triangle around objective before it spawns. Cover all entrances = enemy can't flank. This wins objective fights."""
   
        prompt += f"""

7. MACRO & OBJECTIVES (MANDATORY SECTION - DO NOT SKIP)

   Provide macro analysis based on their objective stats:
   
   Performance: Dragons: {stats.get('avg_dragons', 0):.2f}/game | Barons: {stats.get('avg_barons', 0):.2f}/game | Turrets: {stats.get('avg_turrets', 0):.1f}/game
   
   Key Rules:
   - Wave Priority: Check wave state before rotating (pushed = go, frozen = stay)
   - Objective Timings: Drake 5:00, Baron 20:00, Herald 8:00, Plates fall 14:00
   - Trade Matrix: If enemy takes drake, did you get Herald+plates? Track what you gain vs lose
   - {"Vision Setup: Place deep wards 30s before objectives spawn" if primary_role in ['JUNGLE', 'UTILITY'] else "Rotation: Push wave hard before objective, enemy loses CS if they contest"}
   - Baron Usage: Recall → buy → push SIDE waves (not ARAM mid) → take towers
   - Numbers: 5v4? Force fight. 4v5? Defend, don't fight.

8. 30/60/90 DAY IMPROVEMENT ROADMAP (MANDATORY SECTION - DO NOT SKIP)

   Provide a concrete, day-by-day progression plan with specific targets and habits:
   
   DAYS 1-30: FOUNDATION BUILDING
   
   Week 1-2 Focus: CS MASTERY
   - Every day before ranked: 10min practice tool warmup (target: 80+ CS, no abilities)
   - In games: Track CS at 10min every single game (target: {cs_benchmark * 10:.0f}+)
   - Write down your CS@10 after each game (accountability)
   - Success metric: Hit CS target in 7 out of 10 games
   
   Week 3-4 Focus: VISION DISCIPLINE
   - Add this habit: Buy 1 control ward EVERY back (set a mental trigger: "clicked base = buy pink")
   - Target end-game vision score: {vision_benchmark * 30:.0f}+ in a 30min game
   - Success metric: Average 3+ control wards purchased per game
   
   30-Day Expected Results: CS/min +0.5-1.0, Win Rate +2-4%, fewer surprise deaths
   
   DAYS 31-60: MASTERY PHASE
   
   Focus: Wave management + Objective timing
   - Study resource: Watch "Coach Curtis wave management" on YouTube (30min video, worth it)
   - Learn the 3 wave states: Freeze (deny CS), Slow push (set up dive/roam), Fast push (match roam/reset)
   - In-game application: Catch 3+ side waves per game in mid-game (14-20min mark)
   - New target: {(cs_benchmark + 1) * 10:.0f} CS at 10min (raising the bar)
   - Add habit: Type objective timers in chat ("drake 15:30")
   
   60-Day Expected Results: CS/min +1.0-1.5 total, Win Rate +5-8% total, better macro sense
   
   DAYS 61-90: REFINEMENT & MASTERY
   
   Focus: Consistency + Advanced techniques
   - Champion pool: Play your top 2 champions 70%+ of games (reduce variance)
   - Mechanics: Learn 2-3 advanced combos/cancels for your main (watch high-elo VODs)
   - Study: Watch a Challenger main on your champs, focus on their first 15 minutes (not teamfights)
   - Refinement: Every death should trigger "what could I have seen 30 seconds earlier?"
   
   90-Day Expected Results: CS/min +1.5-2.0 total, Win Rate +8-12% total, consistent high-level performance
   
   Track these metrics weekly: CS@10, Vision score, Deaths/game, Win rate. Progress requires measurement.

Execute this roadmap consistently and your improvement is inevitable.

TONE: Direct, data-driven, encouraging yet honest. Every sentence actionable. Be specific about weaknesses but always show the path to fix them. Motivate improvement, not shame.

IMPORTANT: While their best champion should be highlighted in Section 5 (Champion Pool), avoid making it the central focus of EVERY section. The analysis should primarily focus on fundamental skills (CS, vision, macro, role responsibilities) with champion-specific examples used sparingly. Balance champion mastery advice with broader gameplay improvement.

CRITICAL: You MUST provide ALL 8 SECTIONS. DO NOT skip or omit any section. Even if you need to be brief, every section (1-8) must be present in your response. If you're running short on space:
- Sections 1-3 are MANDATORY and full-length
- Sections 4-6 can be condensed but MUST exist
- Sections 7-8 are MANDATORY and must have real content (not "follow template")

STRUCTURE CHECK: Your response must include these exact section headers:
1. EXECUTIVE SUMMARY
2. STRENGTHS ANALYSIS
3. CRITICAL IMPROVEMENT AREAS
4. PRACTICE STRUCTURE
5. CHAMPION POOL OPTIMIZATION
6. ROLE-SPECIFIC MASTERY PATH
7. MACRO & OBJECTIVES
8. 30/60/90 DAY IMPROVEMENT ROADMAP

Each section must have actual content, not references to templates or formats.
"""

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

    # Get ranked information (if available)
    solo_rank = None
    summoner_id = summoner.get('id')
    
    if summoner_id:
        try:
            print("\nFetching ranked information...")
            ranked_info = riot_client.get_ranked_info(summoner_id)
            
            # Extract solo/duo queue rank (most relevant for analysis)
            if ranked_info:
                for queue in ranked_info:
                    if queue.get('queueType') == 'RANKED_SOLO_5x5':
                        solo_rank = queue
                        print(f"Rank: {queue.get('tier')} {queue.get('rank')} ({queue.get('leaguePoints')} LP)")
                        break
        except Exception as e:
            print(f"Could not fetch ranked info: {e}")
    
    if not solo_rank:
        print("No ranked data found - will analyze based on match history only")

    # Get match history
    print("\nFetching match history (this may take a few minutes)...")
    matches = riot_client.get_full_year_matches(puuid)

    if not matches:
        print("No matches found for this player in the past year!")
        return

    # Process match data
    print("\nProcessing match data...")
    stats = MatchDataProcessor.extract_player_stats(matches, puuid)

    # Generate AI insights with rank-aware coaching
    print("\nGenerating AI-powered coaching insights...")
    prompt = InsightGenerator.create_year_in_review_prompt(stats, display_name, solo_rank)
    insights = bedrock_client.generate_insights(prompt, max_tokens=8000)  # Increased to ensure all 8 sections are complete

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

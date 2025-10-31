"""
Flask API for Rift Rewind
Exposes endpoints for the React frontend to consume
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
from pathlib import Path

from backend import RiotAPIClient, AWSBedrockClient, MatchDataProcessor, InsightGenerator

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize clients globally
riot_api_key = os.getenv('RIOT_API_KEY')
aws_region = os.getenv('AWS_REGION', 'us-east-1')

if not riot_api_key:
    print("Warning: RIOT_API_KEY not found")

riot_client = RiotAPIClient(api_key=riot_api_key, region='na1')
bedrock_client = AWSBedrockClient(region=aws_region)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Rift Rewind API is running'
    })


@app.route('/api/items', methods=['GET'])
def get_items_mapping():
    """Return item ID -> name mapping from items.json (now ID->Name)."""
    try:
        items_path = Path('items.json')
        if not items_path.exists():
            return jsonify({'success': True, 'data': {}})
        with items_path.open('r', encoding='utf-8') as f:
            raw = json.load(f)

        # items.json currently stores name -> id. We need id (string) -> name.
        if isinstance(raw, dict) and raw:
            # Detect schema: if keys look numeric, assume it's already id->name
            sample_key = next(iter(raw.keys()))
            if isinstance(sample_key, str) and sample_key.isdigit():
                # Normalize keys to strings just in case
                normalized = {str(k): v for k, v in raw.items()}
                return jsonify({'success': True, 'data': normalized})
            else:
                # Reverse mapping name->id to id->name
                reversed_map = {}
                for name, item_id in raw.items():
                    try:
                        key = str(int(item_id))  # normalize numeric ids
                    except Exception:
                        key = str(item_id)
                    # Last write wins if duplicates
                    reversed_map[key] = name
                return jsonify({'success': True, 'data': reversed_map})

        return jsonify({'success': True, 'data': {}})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/player/<path:riot_id>', methods=['GET'])
def get_player_info(riot_id):
    """Get player information by Riot ID"""
    try:
        summoner = riot_client.get_summoner_by_riot_id(riot_id)

        if not summoner:
            return jsonify({
                'success': False,
                'error': 'Player not found'
            }), 404

        return jsonify({
            'success': True,
            'data': {
                'puuid': summoner['puuid'],
                'gameName': summoner['gameName'],
                'tagLine': summoner['tagLine'],
                'summonerLevel': summoner['summonerLevel'],
                'profileIconId': summoner.get('profileIconId', 0)
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_player():
    """
    Analyze a player and generate year-in-review

    Request body:
    {
        "riotId": "GameName#TAG"
    }
    """
    try:
        data = request.get_json()
        riot_id = data.get('riotId')

        if not riot_id:
            return jsonify({
                'success': False,
                'error': 'riotId is required'
            }), 400

        # Step 1: Get player info
        summoner = riot_client.get_summoner_by_riot_id(riot_id)

        if not summoner:
            return jsonify({
                'success': False,
                'error': 'Player not found'
            }), 404

        puuid = summoner['puuid']
        display_name = f"{summoner['gameName']}#{summoner['tagLine']}"

        # Step 2: Fetch ranked information using PUUID
        solo_rank = None
        try:
            ranked_info = riot_client.get_ranked_info_by_puuid(puuid)
            if ranked_info:
                for queue in ranked_info:
                    if queue.get('queueType') == 'RANKED_SOLO_5x5':
                        solo_rank = queue
                        break
        except Exception as e:
            print(f"Could not fetch ranked info: {e}")
            # Continue without rank info

        # Step 3: Fetch match history with timelines for inventory snapshots
        matches = riot_client.get_full_year_matches(puuid, include_timeline=True)

        if not matches:
            return jsonify({
                'success': False,
                'error': 'No matches found for this player in the past year'
            }), 404

        # Step 4: Process statistics
        stats = MatchDataProcessor.extract_player_stats(matches, puuid)

        # Step 5: Generate AI coaching insights with rank-aware analysis
        prompt = InsightGenerator.create_year_in_review_prompt(stats, display_name, solo_rank)
        insights = bedrock_client.generate_insights(prompt, max_tokens=8000)  # Increased to ensure all 8 sections are complete

        # Return everything including rank info
        player_data = {
            'gameName': summoner['gameName'],
            'tagLine': summoner['tagLine'],
            'summonerLevel': summoner['summonerLevel'],
            'profileIconId': summoner.get('profileIconId', 0)
        }
        
        # Add rank info if available
        if solo_rank:
            player_data['rank'] = {
                'tier': solo_rank.get('tier'),
                'division': solo_rank.get('rank'),
                'lp': solo_rank.get('leaguePoints'),
                'wins': solo_rank.get('wins'),
                'losses': solo_rank.get('losses')
            }
        
        return jsonify({
            'success': True,
            'data': {
                'player': player_data,
                'stats': stats,
                'insights': insights
            }
        })

    except Exception as e:
        print(f"Error analyzing player: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/stats/<path:riot_id>', methods=['GET'])
def get_player_stats(riot_id):
    """Get player statistics without AI insights (faster)"""
    try:
        # Get player info
        summoner = riot_client.get_summoner_by_riot_id(riot_id)

        if not summoner:
            return jsonify({
                'success': False,
                'error': 'Player not found'
            }), 404

        puuid = summoner['puuid']

        # Fetch match history with timelines
        matches = riot_client.get_full_year_matches(puuid, include_timeline=True)

        if not matches:
            return jsonify({
                'success': False,
                'error': 'No matches found'
            }), 404

        # Process statistics
        stats = MatchDataProcessor.extract_player_stats(matches, puuid)

        return jsonify({
            'success': True,
            'data': {
                'player': {
                    'gameName': summoner['gameName'],
                    'tagLine': summoner['tagLine'],
                    'summonerLevel': summoner['summonerLevel']
                },
                'stats': stats
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chat', methods=['POST'])
def chat_with_coach():
    """
    Interactive chat endpoint for personalized coaching advice

    Request body:
    {
        "message": "User's question",
        "playerData": {
            "player": {...},
            "stats": {...},
            "insights": "..."
        },
        "conversationHistory": [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": "..."}
        ]
    }
    """
    try:
        data = request.get_json()
        user_message = data.get('message')
        player_data = data.get('playerData', {})
        conversation_history = data.get('conversationHistory', [])

        if not user_message:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400

        # Build context-aware prompt
        prompt = _build_chat_prompt(user_message, player_data, conversation_history)

        # Generate response using Bedrock
        response = bedrock_client.generate_insights(prompt, max_tokens=2000)

        return jsonify({
            'success': True,
            'data': {
                'response': response
            }
        })

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def _build_chat_prompt(user_message, player_data, conversation_history):
    """Build a context-aware prompt for the chatbot"""

    stats = player_data.get('stats', {})
    player = player_data.get('player', {})
    insights = player_data.get('insights', '')

    player_name = f"{player.get('gameName', 'Player')}#{player.get('tagLine', '')}"
    rank_info = player.get('rank', {})

    # Build player context summary
    context = f"""You are Ryze, a knowledgeable League of Legends coach. You're providing analysis and guidance to {player_name}.

You're direct, analytical, and focused on improvement. Your coaching style is straightforward - you identify issues clearly and provide actionable solutions. Occasionally reference your extensive experience analyzing gameplay, but keep it subtle. Be honest about weaknesses while acknowledging strengths.

PLAYER PROFILE:
- Summoner: {player_name}
- Level: {player.get('summonerLevel', 'Unknown')}
"""

    if rank_info:
        context += f"- Rank: {rank_info.get('tier', '')} {rank_info.get('division', '')} ({rank_info.get('lp', 0)} LP)\n"
        context += f"- Ranked Record: {rank_info.get('wins', 0)}W / {rank_info.get('losses', 0)}L\n"

    context += f"\nPERFORMANCE STATISTICS (Past Year):\n"
    context += f"- Total Games: {stats.get('total_matches', 0)}\n"
    context += f"- Win Rate: {stats.get('win_rate', 0):.1f}%\n"
    context += f"- Average KDA: {stats.get('avg_kills', 0):.1f}/{stats.get('avg_deaths', 0):.1f}/{stats.get('avg_assists', 0):.1f} (KDA Ratio: {stats.get('kda_ratio', 0):.2f})\n"
    context += f"- CS/Min: {stats.get('cs_per_min', 0):.1f}\n"
    context += f"- Gold/Min: {stats.get('gold_per_min', 0):.0f}\n"
    context += f"- Damage/Min: {stats.get('damage_per_min', 0):.0f}\n"
    context += f"- Vision Score/Game: {stats.get('avg_vision_score', 0):.1f}\n"
    context += f"- Kill Participation: {stats.get('avg_kill_participation', 0):.1f}%\n"

    # Add champion pool info
    champions_played = stats.get('champions_played', {})
    if champions_played:
        top_champs = sorted(champions_played.items(), key=lambda x: x[1].get('games', 0), reverse=True)[:3]
        context += f"\nTOP CHAMPIONS:\n"
        for champ_name, champ_data in top_champs:
            context += f"- {champ_name}: {champ_data.get('games', 0)} games, {champ_data.get('win_rate', 0):.1f}% WR, {champ_data.get('kda', 0):.2f} KDA\n"

    # Add key insights excerpt (first 500 chars)
    if insights:
        context += f"\nKEY INSIGHTS FROM FULL ANALYSIS:\n{insights[:500]}...\n"

    # Add conversation history (last 5 exchanges to manage context window)
    if conversation_history:
        context += "\nCONVERSATION HISTORY:\n"
        recent_history = conversation_history[-10:]  # Last 5 exchanges (10 messages)
        for msg in recent_history:
            role = "Player" if msg['role'] == 'user' else "Ryze"
            context += f"{role}: {msg['content']}\n"

    # Add coaching guidelines
    context += """
COACHING APPROACH:
- Be direct and clear in your analysis
- Provide specific, data-backed recommendations
- Identify both strengths and areas for improvement
- Keep responses concise (2-3 paragraphs max)
- Use their stats to support your points
- Ask targeted follow-up questions when needed
- Maintain a professional but approachable tone
- Avoid excessive jokes or puns
- Focus on actionable next steps

Example tone: "Looking at your 6.2 CS/min, there's clear room for improvement in your farming. Your teamfighting stats are solid though - {avg_kill_participation}% kill participation shows good map awareness. Let's focus on early game laning fundamentals to boost that CS."

"""

    # Add user's current question
    context += f"Player's Question: {user_message}\n\nRespond as Ryze with clear, actionable advice:"

    return context


if __name__ == '__main__':
    print("Starting Rift Rewind API...")
    print("API will be available at http://localhost:5000")
    app.run(debug=True, port=5000)

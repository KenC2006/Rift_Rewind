"""
Flask API for Rift Rewind
Exposes endpoints for the React frontend to consume
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

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

        # Step 2: Fetch match history
        matches = riot_client.get_full_year_matches(puuid)

        if not matches:
            return jsonify({
                'success': False,
                'error': 'No matches found for this player in the past year'
            }), 404

        # Step 3: Process statistics
        stats = MatchDataProcessor.extract_player_stats(matches, puuid)

        # Step 4: Generate AI insights
        prompt = InsightGenerator.create_year_in_review_prompt(stats, display_name)
        insights = bedrock_client.generate_insights(prompt)

        # Return everything
        return jsonify({
            'success': True,
            'data': {
                'player': {
                    'gameName': summoner['gameName'],
                    'tagLine': summoner['tagLine'],
                    'summonerLevel': summoner['summonerLevel'],
                    'profileIconId': summoner.get('profileIconId', 0)
                },
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

        # Fetch match history
        matches = riot_client.get_full_year_matches(puuid)

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


if __name__ == '__main__':
    print("Starting Rift Rewind API...")
    print("API will be available at http://localhost:5000")
    app.run(debug=True, port=5000)

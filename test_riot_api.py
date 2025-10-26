"""
Test script to verify Riot API key is working
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_riot_api():
    """Test if Riot API key is valid"""

    api_key = os.getenv('RIOT_API_KEY')

    print("Testing Riot API connection...\n")

    # Check if key exists
    if not api_key:
        print("✗ RIOT_API_KEY not found in .env file")
        return

    print(f"✓ API Key found: {api_key[:20]}...")
    print(f"  Full key: {api_key}")
    print(f"  Length: {len(api_key)} characters")
    print(f"  Starts with RGAPI-: {api_key.startswith('RGAPI-')}")
    print(f"  Has whitespace: {api_key != api_key.strip()}\n")

    # Test API call with account API (using Riot ID)
    game_name = 'Doublelift'
    tag_line = 'NA1'

    # Account API uses regional routing
    url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    headers = {'X-Riot-Token': api_key}

    print(f"Testing API call for Riot ID: {game_name}#{tag_line}")
    print(f"URL: {url}\n")

    try:
        response = requests.get(url, headers=headers)

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✓ SUCCESS! API key is working!\n")
            print(f"Found account: {data['gameName']}#{data['tagLine']}")
            print(f"PUUID: {data['puuid'][:20]}...\n")
            print("="*60)
            print("Your Riot API is configured correctly!")
            print("Try running backend.py with a Riot ID (GameName#TAG).")
            print("="*60)
        elif response.status_code == 403:
            print("✗ 403 Forbidden - API key is invalid or expired")
            print("\nSolutions:")
            print("1. Go to https://developer.riotgames.com/")
            print("2. Sign in and regenerate your API key")
            print("3. Copy the NEW key to your .env file")
            print("4. Make sure there are no quotes or extra spaces")
        elif response.status_code == 401:
            print("✗ 401 Unauthorized - API key is expired or unknown")
            print("\nSolutions:")
            print("1. Go to https://developer.riotgames.com/")
            print("2. Regenerate your API key (dev keys expire every 24 hours)")
            print("3. Update .env with the new key")
        elif response.status_code == 404:
            print("✗ 404 Not Found - Riot ID doesn't exist (this shouldn't happen with Doublelift#NA1)")
        else:
            print(f"✗ Unexpected error: {response.text}")

    except Exception as e:
        print(f"✗ Request failed: {e}")

if __name__ == "__main__":
    test_riot_api()

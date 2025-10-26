"""
Quick test script to verify AWS Bedrock connection
"""
import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

def test_bedrock_connection():
    """Test if we can connect to Bedrock and invoke Claude"""

    print("Testing AWS Bedrock connection...\n")

    # Check credentials
    aws_region = os.getenv('AWS_REGION', 'us-east-1')
    print(f"Region: {aws_region}")

    # Initialize client
    try:
        client = boto3.client(
            service_name='bedrock-runtime',
            region_name=aws_region
        )
        print("✓ Bedrock client initialized\n")
    except Exception as e:
        print(f"✗ Failed to initialize client: {e}")
        return

    # Test model invocation
    print("Testing Claude 3.5 Sonnet invocation...")

    # Use inference profile instead of direct model ID
    model_id = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 200,
        "messages": [
            {
                "role": "user",
                "content": "Say hello and confirm you're working! Keep it brief."
            }
        ]
    }

    try:
        response = client.invoke_model(
            modelId=model_id,
            body=json.dumps(request_body)
        )

        response_body = json.loads(response['body'].read())
        result = response_body['content'][0]['text']

        print("✓ SUCCESS! Claude responded:\n")
        print(f"  {result}\n")
        print("="*60)
        print("Your AWS Bedrock setup is working correctly!")
        print("You're ready to run the main application.")
        print("="*60)

    except Exception as e:
        print(f"✗ Error invoking model: {e}\n")

        if "AccessDeniedException" in str(e):
            print("Issue: You don't have permission to invoke this model")
            print("Solution: Make sure your IAM user has AmazonBedrockFullAccess policy")
        elif "ResourceNotFoundException" in str(e):
            print("Issue: Model not found or not available in your region")
            print("Solution: Try changing AWS_REGION in .env to 'us-west-2' or 'us-east-1'")
        elif "ValidationException" in str(e):
            print("Issue: Model access not enabled")
            print("Solution: Check Bedrock console - you may need to enable foundation model access")
        else:
            print("Check your AWS credentials and region configuration")

if __name__ == "__main__":
    test_bedrock_connection()

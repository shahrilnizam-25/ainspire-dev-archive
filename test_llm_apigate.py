import json
import os
import time
import requests

# =====================================================
# CONFIGURATION
# =====================================================

CLIENT_ID = os.environ["TM_APIGATE_CLIENT_ID"]
CLIENT_SECRET = os.environ["TM_APIGATE_CLIENT_SECRET"]
CHAT_KEY = os.environ["TM_APIGATE_CHAT_KEY"]
MODEL_NAME = os.getenv("TM_LLM_MODEL", "gpt-oss-20b")

TOKEN_URL = "https://api.apigate.tm.com.my/token"

API_URL = (
    "https://api.apigate.tm.com.my/"
    "t/tm.com.my/AI-Foundry-Service/1.82.1/"
    "v1/chat/completions"
)

TOKEN_CACHE_FILE = "token_cache.json"

# Refresh token 60 seconds before actual expiry
REFRESH_BUFFER = 60


# =====================================================
# TOKEN FUNCTIONS
# =====================================================

def save_token(access_token, expires_in):
    expiry_time = int(time.time()) + expires_in

    cache_data = {
        "access_token": access_token,
        "expiry_time": expiry_time
    }

    with open(TOKEN_CACHE_FILE, "w") as f:
        json.dump(cache_data, f)

    print(
        f"Token saved. "
        f"Expires at {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(expiry_time))}"
    )


def load_token():
    if not os.path.exists(TOKEN_CACHE_FILE):
        return None

    with open(TOKEN_CACHE_FILE, "r") as f:
        return json.load(f)


def is_token_valid(token_data):
    if not token_data:
        return False

    current_time = int(time.time())
    expiry_time = token_data["expiry_time"]

    return current_time < (expiry_time - REFRESH_BUFFER)


def request_new_token():

    print("Generating NEW access token...")

    response = requests.post(
        TOKEN_URL,
        auth=(CLIENT_ID, CLIENT_SECRET),
        data={
            "grant_type": "client_credentials"
        }
    )

    response.raise_for_status()

    token_response = response.json()

    access_token = token_response["access_token"]
    expires_in = token_response.get("expires_in", 3600)

    save_token(access_token, expires_in)

    return access_token


def get_valid_token():

    token_data = load_token()

    if is_token_valid(token_data):
        print("Using EXISTING cached token")
        return token_data["access_token"]

    print("Cached token missing or expired")
    return request_new_token()


# =====================================================
# AI FOUNDRY CALL
# =====================================================

def chat(prompt):

    token = get_valid_token()

    headers = {
        "Authorization": f"Bearer {token}",
        "x-litellm-api-key": CHAT_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    response = requests.post(
        API_URL,
        headers=headers,
        json=payload,
        timeout=120
    )

    print(f"HTTP Status: {response.status_code}")

    response.raise_for_status()

    return response.json()


# =====================================================
# MAIN
# =====================================================

if __name__ == "__main__":

    result = chat(
        "Apakah maksud supercalifragilisticexpialidocious?"
    )

    print("\n===== RESPONSE =====\n")

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        )
    )
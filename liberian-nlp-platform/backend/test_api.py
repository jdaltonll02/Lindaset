#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.urls import reverse
import json

def test_languages_api():
    client = Client()
    
    # Test the languages list endpoint
    try:
        response = client.get('/api/v1/languages/')
        print(f"Languages API Status: {response.status_code}")
        if response.status_code == 200:
            data = json.loads(response.content)
            print(f"Response: {data}")
        else:
            print(f"Error: {response.content}")
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    test_languages_api()
import requests

url = "https://download.opendesign.com/guestfiles/ODAFileConverter/ODAFileConverter_25.2.0.0_Linux_3.10_11.deb"
try:
    response = requests.head(url, timeout=5)
    print(f"Status Code: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")

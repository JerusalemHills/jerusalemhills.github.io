import requests
import os
import time

# Create a folder to store downloaded images
folder_name = "Seder_Tefilat_Yeshurun_Images"
if not os.path.exists(folder_name):
    os.makedirs(folder_name)

# Base URL components
base_url = "https://ia601600.us.archive.org/BookReader/BookReaderImages.php"
file_prefix = "Seder%20Tefilat%20Yeshurun%20(Menahem%20ben%20Mosheh%20Yehezqel%201935)_jp2/Seder%20Tefilat%20Yeshurun%20(Menahem%20ben%20Mosheh%20Yehezqel%201935)_"
file_suffix = ".jp2"
query = "?zip=/0/items/seder-tefilat-yeshurun-menahem-ben-mosheh-yehezqel-1935/Seder%20Tefilat%20Yeshurun%20(Menahem%20ben%20Mosheh%20Yehezqel%201935)_jp2.zip&id=seder-tefilat-yeshurun-menahem-ben-mosheh-yehezqel-1935&scale=4&rotate=0"

# Function to download an image with retries
def download_image(url, local_path, retries=3, delay=5):
    for attempt in range(retries):
        try:
            response = requests.get(url)
            if response.status_code == 200:
                with open(local_path, "wb") as file:
                    file.write(response.content)
                print(f"Saved {local_path}")
                return True
            else:
                print(f"Failed to download {local_path} (status code: {response.status_code})")
        except requests.exceptions.RequestException as e:
            print(f"Error downloading {local_path}: {e}")
        if attempt < retries - 1:
            print(f"Retrying in {delay} seconds...")
            time.sleep(delay)
    return False

# Loop through image numbers and download each
for i in range(636):  # 0 to 635 inclusive
    file_name = f"{i:04}"  # Zero-padded numbers (e.g., 0000, 0001, ...)
    full_url = f"{base_url}{query}&file={file_prefix}{file_name}{file_suffix}"
    local_path = f"{folder_name}/{file_name}.jp2"
    
    print(f"Downloading {full_url}...")
    
    if not download_image(full_url, local_path):
        print(f"Failed to download {file_name}.jp2 from URL, using local file if available.")
        if os.path.exists(local_path):
            print(f"Loaded {file_name}.jp2 from local storage.")
        else:
            print(f"Local file {file_name}.jp2 not found.")

print("Download completed!")

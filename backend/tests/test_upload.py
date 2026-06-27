import requests

url = "http://127.0.0.1:5000/artifacts/upload"

with open(r"C:\Users\Noor Afshan\Documents\mlops-tracker\tests\sample.txt", "rb") as f:

    files = {
        "file": f
    }

    data = {
        "run_id": 1
    }

    response = requests.post(
        url,
        files=files,
        data=data
    )

print(response.status_code)
print(response.text)
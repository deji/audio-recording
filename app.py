import base64, time

from flask import Flask
from flask import render_template, request

app = Flask(__name__)

@app.route('/')
def homepage():
    return render_template('index.html')

@app.route('/save_audio', methods=['POST'])
def save_audio():
    audio_data = request.get_data()
    with open("recordings/audio-record" + str(time.time()) + ".wav", "wb") as fh:
        # remove the initial data:audio/wav;base64, string
        fh.write(base64.decodebytes(audio_data[22:]))
    return "OK", 200

if __name__ == '__main__':
    app.run()

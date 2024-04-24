from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from connect_mqtt import connect_mqtt

# import tensorflow as tf
import torch
from inference import load_model
import numpy as np
import time

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# occupancy_model = tf.keras.models.load_model(r'C:\Users\yhan8\OneDrive\Documents\BitCamp\training\occupancy-detection-uci-data\CODE_FILES\temperature_model.keras')
occupancy_model = load_model("best_weights.pth")
OCCUPANCY_THRESHOLD = 0.5

start = time.time()


def rand_float():
    return round(100 * abs(np.random.normal()), 3)


"""def generate_sample_data():
    return {
        "temperature": rand_float(),
        "co2": rand_float(),
        "humidity": rand_float(),
        "voc": rand_float(),
        "occupancy": 1
    }"""

# def update_data():
#     threading.Timer(2, update_data).start()
#     sample_data = generate_sample_data()
#     socketio.emit("sensor_data", sample_data)
#     socketio.emit("occupancy", True)

# update_data()


@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print("Connect event emitted")
    emit("connect", include_self=False, broadcast=True)


def handle_sensor_data(data):
    socketio.emit(
        "sensor_data",
        {
            "temperature": data["temperature"],
            "co2": data["CO2"],
            "humidity": data["humidity"],
            "voc": data["VOC"],
            "pir": data["PIR"],
        },
    )

    occupancy = occupancy_model_quantum(data)
    socketio.emit("occupancy", occupancy)


def occupancy_model_keras(data):
    data_arr = np.array(
        [[float(data["temperature"]), float(data["humidity"]), float(data["CO2"])]]
    )
    return occupancy_model.predict(data_arr, verbose=0)[0][0] > OCCUPANCY_THRESHOLD


def occupancy_model_quantum(data):
    data_arr = torch.tensor(
        [[float(data["temperature"]), float(data["humidity"]), float(data["CO2"])]]
    )
    return occupancy_model(data_arr)[0][0].item() > OCCUPANCY_THRESHOLD


try:
    print("Connecting to mqtt...")
    connect_mqtt(handle_data=handle_sensor_data)
except Exception as e:
    print(f"Failed to connect to socket: {e}")

if __name__ == "__main__":
    socketio.run(app, debug=True, port=4003)

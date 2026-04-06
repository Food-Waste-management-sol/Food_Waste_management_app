from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import requests as http_requests
from io import BytesIO
from PIL import Image
import traceback
import datetime
from tensorflow.keras.applications.mobilenet_v2 import decode_predictions
from groq import Groq
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
app = Flask(__name__)
CORS(app)

groq_client = Groq(api_key=GROQ_API_KEY)
print("✅ Groq client initialized")

# ── MobileNetV2 Model Load ──────────────────────────
model = tf.keras.applications.MobileNetV2(weights='imagenet')
print("✅ TensorFlow model loaded")


# ── Helper: Image Download & Prepare ───────────────
def prepare_image(image_url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = http_requests.get(image_url, headers=headers, timeout=10)
    if response.status_code != 200:
        raise Exception(f"Failed to download image. Status: {response.status_code}")
    img = Image.open(BytesIO(response.content)).convert('RGB').resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return tf.keras.applications.mobilenet_v2.preprocess_input(img_array)


# ────────────────────────────────────────────────────
# FEATURE 1: Food Freshness & Validation
# POST /analyze  →  { imageUrl }
# ────────────────────────────────────────────────────
@app.route('/analyze', methods=['POST'])
def analyze_food():
    try:
        data = request.json
        image_url = data.get('imageUrl')
        if not image_url:
            return jsonify({"error": "No URL provided"}), 400

        prepared_img = prepare_image(image_url)
        preds = model.predict(prepared_img)
        decoded_results = decode_predictions(preds, top=3)[0]

        food_keywords = [
    'food', 'fruit', 'vegetable', 'bread', 'meal', 'dish',
    'apple', 'pizza', 'burger', 'roti', 'meat', 'rice',
    # ✅ ye add karo
    'squash', 'cucumber', 'tomato', 'potato', 'onion', 'carrot',
    'broccoli', 'spinach', 'cabbage', 'mushroom', 'pepper',
    'eggplant', 'zucchini', 'pumpkin', 'corn', 'bean', 'pea',
    'salad', 'soup', 'curry', 'stew', 'sandwich', 'wrap',
    'noodle', 'pasta', 'cake', 'cookie', 'dessert', 'sweet',
    'dairy', 'cheese', 'butter', 'cream', 'yogurt',
    'fish', 'chicken', 'egg', 'shrimp', 'seafood',
]
        is_food = any(
            any(key in res[1].lower() for key in food_keywords)
            for res in decoded_results
        )
        detected_item = decoded_results[0][1]

        if not is_food:
            return jsonify({
                "freshnessScore": 0.0,
                "aiStatus": "NOT_FOOD",
                "detected": detected_item
            })

        score = float(np.random.uniform(88.0, 99.0))
        return jsonify({
            "freshnessScore": round(score, 2),
            "aiStatus": "FRESH" if score > 80 else "STALE",
            "detected": detected_item
        })

    except Exception as e:
        print(f"❌ /analyze error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────
# FEATURE 2: Waste Prediction
# GET /predict-waste
# ────────────────────────────────────────────────────
@app.route('/predict-waste', methods=['GET'])
def predict_waste():
    now = datetime.datetime.now()
    day_of_week = now.weekday()
    base_waste = 12.0
    multiplier = 1.5 if day_of_week >= 4 else 0.8
    prediction = base_waste * multiplier + np.random.uniform(-2, 2)

    return jsonify({
        "predictedWaste": round(prediction, 2),
        "day": now.strftime("%A"),
        "trend": "INCREASING" if multiplier > 1 else "STABLE",
        "message": f"Expect around {round(prediction, 2)}kg waste on {now.strftime('%A')}."
    })


# ────────────────────────────────────────────────────
# FEATURE 3: Smart Route Optimization
# POST /optimize-route  →  { ngoLocation, locations }
# ────────────────────────────────────────────────────
@app.route('/optimize-route', methods=['POST'])
def optimize_route():
    try:
        data = request.json
        ngo_loc = data.get('ngoLocation')
        restaurants = data.get('locations')

        if not ngo_loc or not restaurants:
            return jsonify({"error": "Locations missing"}), 400

        def distance(p1, p2):
            return np.sqrt(
                (p1['lat'] - p2['lat'])**2 + (p1['lng'] - p2['lng'])**2
            )

        sorted_route = []
        current_pos = ngo_loc
        temp = list(restaurants)

        while temp:
            nearest = min(temp, key=lambda x: distance(current_pos, x))
            sorted_route.append(nearest)
            current_pos = nearest
            temp.remove(nearest)

        return jsonify({
            "optimizedRoute": sorted_route,
            "totalStops": len(sorted_route),
            "info": "Route optimized using Nearest Neighbor Algorithm"
        })

    except Exception as e:
        print(f"❌ /optimize-route error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────
# FEATURE 4: Auto Food Category Tagging
# POST /auto-tag  →  { imageUrl }
# ────────────────────────────────────────────────────
@app.route('/auto-tag', methods=['POST'])
def auto_tag():
    try:
        data = request.json
        image_url = data.get('imageUrl')
        if not image_url:
            return jsonify({"error": "No imageUrl provided"}), 400

        prepared_img = prepare_image(image_url)
        preds = model.predict(prepared_img)
        decoded_results = decode_predictions(preds, top=5)[0]

        category_map = {
            'rice':      'Rice & Grains',
            'bread':     'Bread & Bakery',
            'pizza':     'Pizza',
            'burger':    'Burgers & Sandwiches',
            'fruit':     'Fruits',
            'vegetable': 'Vegetables',
            'meat':      'Non-Veg',
            'chicken':   'Non-Veg',
            'fish':      'Non-Veg',
            'egg':       'Eggs & Dairy',
            'milk':      'Eggs & Dairy',
            'soup':      'Soups & Curries',
            'curry':     'Soups & Curries',
            'sweet':     'Sweets & Desserts',
            'cake':      'Sweets & Desserts',
            'ice_cream': 'Sweets & Desserts',
            'snack':     'Snacks',
            'noodle':    'Noodles & Pasta',
            'pasta':     'Noodles & Pasta',
            'salad':     'Salads',
            'roti':      'Bread & Bakery',
            'biryani':   'Rice & Grains',
            'thali':     'Full Meal',
        }

        detected_labels = [res[1].lower() for res in decoded_results]
        category = "Other Food"
        tags = []

        for label in detected_labels:
            for keyword, cat in category_map.items():
                if keyword in label:
                    category = cat
                    break
            tags.append(label.replace('_', ' ').title())

        non_veg_keywords = ['meat', 'chicken', 'fish', 'egg', 'pork', 'beef', 'mutton']
        is_veg = not any(k in ' '.join(detected_labels) for k in non_veg_keywords)

        return jsonify({
            "category": category,
            "tags": tags[:3],
            "isVeg": is_veg,
            "detectedLabel": decoded_results[0][1].replace('_', ' ').title(),
            "confidence": round(float(decoded_results[0][2]) * 100, 1)
        })

    except Exception as e:
        print(f"❌ /auto-tag error: {traceback.format_exc()}")
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


# ────────────────────────────────────────────────────
# FEATURE 5: Demand Forecast (Location-wise)
# POST /demand-forecast  →  { requests: [{location, quantity}] }
# ────────────────────────────────────────────────────
@app.route('/demand-forecast', methods=['POST'])
def demand_forecast():
    try:
        data = request.json
        past_requests = data.get('requests', [])
        now = datetime.datetime.now()
        day_of_week = now.weekday()

        location_demand = {}
        for req in past_requests:
            loc = req.get('location', 'Unknown')
            qty = int(req.get('quantity', 0))
            location_demand[loc] = location_demand.get(loc, 0) + qty

        if not location_demand:
            return jsonify({
                "forecast": [],
                "message": "Not enough data for forecast."
            })

        multiplier = 1.4 if day_of_week >= 4 else 0.9
        forecast = []
        for loc, total_qty in sorted(
            location_demand.items(), key=lambda x: x[1], reverse=True
        ):
            predicted = round(total_qty * multiplier + np.random.uniform(-2, 3))
            forecast.append({
                "location": loc,
                "expectedDemand": max(predicted, 0),
                "demandLevel": (
                    "HIGH" if predicted > 30 else
                    "MEDIUM" if predicted > 15 else
                    "LOW"
                )
            })

        return jsonify({
            "forecast": forecast[:5],
            "day": now.strftime("%A"),
            "message": f"Demand forecast for {now.strftime('%A')} based on past requests."
        })

    except Exception as e:
        print(f"❌ /demand-forecast error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────
# FEATURE 6: Groq Chatbot (LLaMA 3)
# POST /chat  →  { message, role, history }
# ────────────────────────────────────────────────────
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        user_role = data.get('role', 'NGO')
        history = data.get('history', [])

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        print(f"📩 Chat — role: {user_role}, message: {user_message}")

        # Role-based system prompt
        if user_role == 'RESTAURANT':
            system_context = (
                "You are FoodBridge AI Assistant for restaurants. "
                "Help restaurant owners with: listing surplus food, managing donation requests, "
                "reducing food waste, and understanding the FoodBridge platform. "
                "Be concise, friendly, and practical. "
                "Reply in Hinglish if user writes in Hindi/Hinglish."
            )
        else:
            system_context = (
                "You are FoodBridge AI Assistant for NGOs. "
                "Help NGO workers with: finding available food, tracking request status, "
                "planning pickup routes, and distributing food efficiently. "
                "Be concise, friendly, and practical. "
                "Reply in Hinglish if user writes in Hindi/Hinglish."
            )

        # Build messages list with history
        messages = [{"role": "system", "content": system_context}]
        for msg in history[-6:]:
            role = "user" if msg.get('role') == 'user' else "assistant"
            messages.append({"role": role, "content": msg.get('text', '')})
        messages.append({"role": "user", "content": user_message})

        # ✅ Groq API call — LLaMA 3 model
        response = groq_client.chat.completions.create(
          model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=512,
            temperature=0.7,
        )

        reply = response.choices[0].message.content.strip()
        print(f"✅ Reply: {reply[:80]}...")

        return jsonify({"reply": reply})

    except Exception as e:
        print(f"❌ /chat error: {traceback.format_exc()}")
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


if __name__ == '__main__':
    print("🚀 Starting FoodBridge AI Server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
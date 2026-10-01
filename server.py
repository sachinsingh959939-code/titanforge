"""
TITAN FORGE - MONGODB BACKEND & REST API SERVER
Connects the Gym Web Application to MongoDB (Local or MongoDB Atlas Cloud)
"""

import http.server
import socketserver
import json
import os
import sys
import datetime
import threading
import time
import re
import smtplib
import secrets
import hashlib
from email.message import EmailMessage
from urllib.parse import urlparse, quote
from urllib import request, parse

# Ensure UTF-8 output on Windows consoles
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load Configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'mongo_config.json')
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "titan_forge_gym"
PORT = 8000
GOOGLE_SESSIONS = {}
GOOGLE_OAUTH_STATES = {}

if os.path.exists(CONFIG_PATH):
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            MONGO_URI = cfg.get('mongo_uri', MONGO_URI)
            DB_NAME = cfg.get('database_name', DB_NAME)
            PORT = cfg.get('port', PORT)
    except Exception as e:
        print("Warning reading config:", e)

MONGO_URI = os.getenv('MONGO_URI', MONGO_URI)
DB_NAME = os.getenv('MONGO_DB_NAME', DB_NAME)
PORT = int(os.getenv('PORT', PORT))

# MongoDB Connection Setup
mongo_client = None
mongo_db = None
mongodb_connected = False

try:
    from pymongo import MongoClient
    # 2 second timeout for connection check
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500)
    mongo_client.admin.command('ping')
    mongo_db = mongo_client[DB_NAME]
    mongodb_connected = True
    print("=" * 60)
    print(f"  [SUCCESS] Connected to MongoDB: {DB_NAME}")
    print(f"  URI: {MONGO_URI.split('@')[-1] if '@' in MONGO_URI else MONGO_URI}")
    print("=" * 60)
except Exception as err:
    print("=" * 60)
    print("  [INFO] MongoDB offline or waiting for Atlas credentials.")
    print("  Local backup mode activated (Data will be stored locally in gym_backup.json).")
    print(f"  Connection note: {err}")
    print("=" * 60)

# Local Storage Backup
BACKUP_FILE = os.path.join(os.path.dirname(__file__), 'gym_backup.json')


def normalize_phone(phone):
    digits = re.sub(r'\D', '', str(phone or ''))
    if not digits:
        return ''
    if digits.startswith('0') and len(digits) == 10:
        return '91' + digits[1:]
    if digits.startswith('91') and len(digits) == 12:
        return digits
    if len(digits) == 10:
        return '91' + digits
    return digits


def build_wa_url(phone, message):
    clean = normalize_phone(phone)
    if not clean:
        return ''
    return f'https://wa.me/{clean}?text={quote(message)}'


def get_email_config():
    admin_email = "sachinkumar959939@gmail.com"
    smtp_user = "sachinkumar959939@gmail.com"
    smtp_pass = os.getenv('GMAIL_APP_PASSWORD') or os.getenv('EMAIL_PASS') or ""
    smtp_enabled = True

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                cfg = json.load(f)
                admin_email = cfg.get('admin_email', admin_email)
                smtp_user = cfg.get('smtp_user', smtp_user)
                if cfg.get('smtp_app_password'):
                    smtp_pass = cfg.get('smtp_app_password')
                smtp_enabled = cfg.get('smtp_enabled', smtp_enabled)
        except Exception as e:
            print("Error reading email config:", e)
    return {
        'admin_email': admin_email,
        'smtp_user': smtp_user,
        'smtp_pass': smtp_pass,
        'smtp_enabled': smtp_enabled
    }


def save_email_config(new_cfg):
    cfg = {}
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                cfg = json.load(f)
        except Exception:
            cfg = {}
    if 'admin_email' in new_cfg:
        cfg['admin_email'] = new_cfg['admin_email']
    if 'smtp_user' in new_cfg:
        cfg['smtp_user'] = new_cfg['smtp_user']
    if 'smtp_app_password' in new_cfg and new_cfg['smtp_app_password']:
        cfg['smtp_app_password'] = new_cfg['smtp_app_password'].replace(" ", "")
    if 'smtp_enabled' in new_cfg:
        cfg['smtp_enabled'] = bool(new_cfg['smtp_enabled'])
    try:
        with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
            json.dump(cfg, f, indent=2)
        return True
    except Exception as e:
        print("Error saving email config:", e)
        return False


def send_admin_email_alert(subject, text_body, html_body=None):
    cfg = get_email_config()
    to_email = cfg['admin_email']
    smtp_user = cfg['smtp_user']
    smtp_pass = cfg['smtp_pass']

    if not cfg['smtp_enabled']:
        print(f"[Email Alert] Alerts currently disabled in settings for {to_email}")
        return False

    if not smtp_pass:
        print("=" * 60)
        print(f"  [ENQUIRY RECEIVED FOR: {to_email}]")
        print(f"  Subject: {subject}")
        print("  " + "-" * 56)
        for line in text_body.strip().split('\n'):
            print(f"  {line}")
        print("  " + "-" * 56)
        print("  💡 NOTE: To deliver straight to your Gmail inbox, paste your")
        print("     16-character Gmail App Password into mongo_config.json")
        print("     (or Admin Dashboard > Settings)")
        print("=" * 60)
        return False

    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = f"Titan Forge Gym <{smtp_user}>"
        msg['To'] = to_email
        msg.set_content(text_body)
        if html_body:
            msg.add_alternative(html_body, subtype='html')

        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=12) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        print(f"[Email Alert Sent] Successfully delivered email notification to {to_email} ({subject})")
        return True
    except Exception as err:
        print(f"[Email Alert Error] Could not send email to {to_email}: {err}")
        return False


def dispatch_enquiry_notification(coll_name, payload):
    created_at = payload.get('created_at') or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if coll_name == 'vip_leads':
        name = payload.get('name', 'Anonymous')
        phone = payload.get('phone', 'N/A')
        email = payload.get('email', 'N/A')
        branch = payload.get('branch', 'Downtown')
        goal = payload.get('goal', 'Hypertrophy & Muscle Gain')

        subject = f"🔥 New VIP Pass Enquiry - {name}"
        text_body = f"""New Free VIP Pass Enquiry Received!

👤 Name: {name}
📞 Phone / WhatsApp: {phone}
✉️ Email: {email}
🏋️ Preferred Branch: {branch}
🎯 Fitness Goal: {goal}
⏰ Timestamp: {created_at}

Manage all leads in Admin Dashboard: http://localhost:8000/admin.html
"""
        threading.Thread(target=send_admin_email_alert, args=(subject, text_body), daemon=True).start()

    elif coll_name == 'memberships':
        name = payload.get('name', 'Anonymous')
        phone = payload.get('phone', 'N/A')
        email = payload.get('email', 'N/A')
        tier = payload.get('tier', 'Membership')
        amount = payload.get('amount', 0)
        pay_mode = payload.get('payment_method') or payload.get('pay_mode', 'N/A')
        utr = payload.get('utr', 'N/A')

        subject = f"🏆 New Membership Registration - {name} ({tier})"
        text_body = f"""New Membership Registration Received!

👤 Member: {name}
📞 Phone: {phone}
✉️ Email: {email}
💳 Plan Tier: {tier}
💰 Amount: ₹{amount}
🏦 Payment Mode: {pay_mode}
🔢 Transaction Ref / UTR: {utr}
⏰ Timestamp: {created_at}

Manage memberships at: http://localhost:8000/admin.html
"""
        threading.Thread(target=send_admin_email_alert, args=(subject, text_body), daemon=True).start()

    elif coll_name == 'class_bookings':
        name = payload.get('member_name') or payload.get('name', 'Anonymous')
        phone = payload.get('phone', 'N/A')
        class_name = payload.get('class_name', 'Class Session')
        trainer = payload.get('trainer', '')
        booking_type = payload.get('type', 'class')

        if booking_type == 'trainer_consultation':
            subject = f"🤝 New 1-on-1 Consultation Request - {name} ({trainer})"
            text_body = f"""New 1-on-1 Coach Consultation Request!

👤 Client: {name}
📞 Phone / WhatsApp: {phone}
🏋️ Assigned Coach: {trainer}
⏰ Timestamp: {created_at}
"""
        else:
            subject = f"📅 New Class Booking - {name} ({class_name})"
            text_body = f"""New Class Spot Reserved!

👤 Member: {name}
📞 Phone: {phone}
🏋️ Class: {class_name}
⏰ Timestamp: {created_at}
"""
        threading.Thread(target=send_admin_email_alert, args=(subject, text_body), daemon=True).start()

    elif coll_name == 'orders':
        name = payload.get('name', 'Anonymous')
        phone = payload.get('phone', 'N/A')
        address = payload.get('address', 'N/A')
        city = payload.get('city', 'N/A')
        total = payload.get('total', 0)
        items = payload.get('items', [])
        if isinstance(items, list):
            items_summary = ", ".join([f"{item.get('name', 'Item')} (x{item.get('quantity', 1)})" for item in items])
        else:
            items_summary = str(items)

        subject = f"🛒 New Store Order - ₹{total} from {name}"
        text_body = f"""New Supplement / Merchandise Order!

👤 Customer: {name}
📞 Phone / WhatsApp: {phone}
📍 Delivery Address: {address}, {city}
📦 Order Items: {items_summary}
💰 Total Amount: ₹{total}
⏰ Timestamp: {created_at}
"""
        threading.Thread(target=send_admin_email_alert, args=(subject, text_body), daemon=True).start()

    elif coll_name == 'reviews':
        name = payload.get('author_name', 'Anonymous')
        rating = payload.get('rating', 5)
        comment = payload.get('comment', '')
        location = payload.get('location_name', 'Gym')

        subject = f"⭐ New Gym Review - {rating} Stars by {name}"
        text_body = f"""New Member Review Submitted!

👤 Member: {name}
📍 Branch: {location}
⭐ Rating: {rating} / 5
💬 Feedback: "{comment}"
⏰ Timestamp: {created_at}
"""
        threading.Thread(target=send_admin_email_alert, args=(subject, text_body), daemon=True).start()


def send_provider_message(reminder):
    message = reminder.get('message') or 'Your Titan Forge reminder.'
    phone = reminder.get('phone') or ''
    email = reminder.get('email') or ''
    clean_phone = normalize_phone(phone)

    email_cfg = get_email_config()
    smtp_user = email_cfg['smtp_user']
    smtp_pass = email_cfg['smtp_pass']
    if smtp_user and smtp_pass and email:
        try:
            msg = EmailMessage()
            msg['Subject'] = 'Titan Forge Daily Reminder'
            msg['From'] = smtp_user
            msg['To'] = email
            msg.set_content(message)
            with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=10) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            return {'status': 'sent', 'provider': 'gmail_smtp', 'email': email}
        except Exception as e:
            print('Gmail SMTP error:', e)

    twilio_sid = os.getenv('TWILIO_ACCOUNT_SID')
    twilio_token = os.getenv('TWILIO_AUTH_TOKEN')
    twilio_from = os.getenv('TWILIO_FROM')
    if twilio_sid and twilio_token and twilio_from and clean_phone:
        payload = parse.urlencode({
            'To': f'whatsapp:{clean_phone}',
            'From': twilio_from,
            'Body': message
        }).encode()
        auth = (twilio_sid + ':' + twilio_token).encode('utf-8')
        req = request.Request(
            f'https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json',
            data=payload,
            method='POST'
        )
        req.add_header('Authorization', 'Basic ' + __import__('base64').b64encode(auth).decode('utf-8'))
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        try:
            with request.urlopen(req, timeout=15) as resp:
                return {'status': 'sent', 'provider': 'twilio', 'response_code': resp.getcode()}
        except Exception as e:
            print('Twilio send error:', e)

    whatsapp_token = os.getenv('WHATSAPP_ACCESS_TOKEN')
    whatsapp_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID')
    if whatsapp_token and whatsapp_number_id and clean_phone:
        payload = json.dumps({
            'messaging_product': 'whatsapp',
            'to': clean_phone,
            'type': 'text',
            'text': {'body': message}
        }).encode('utf-8')
        req = request.Request(
            f'https://graph.facebook.com/v20.0/{whatsapp_number_id}/messages',
            data=payload,
            headers={
                'Authorization': f'Bearer {whatsapp_token}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            method='POST'
        )
        try:
            with request.urlopen(req, timeout=15) as resp:
                return {'status': 'sent', 'provider': 'whatsapp', 'response_code': resp.getcode()}
        except Exception as e:
            print('WhatsApp send error:', e)

    return {'status': 'simulated', 'provider': 'free_browser', 'wa_url': build_wa_url(phone, message), 'mailto': email}


def persist_reminder(reminder):
    local = load_local_data()
    reminders = local.setdefault('reminders', [])
    reminders.insert(0, reminder)
    save_local_data(local)
    return reminder


DEFAULT_PRODUCTS = [
    {
        "id": "prod-1",
        "name": "VOLT 100% Pure Whey Isolate (2.5kg)",
        "category": "Supplements",
        "price": 4499,
        "originalPrice": 5499,
        "badge": "Best Seller",
        "rating": 4.9,
        "reviews": 428,
        "image": "assets/supplements.jpg",
        "shortDesc": "30g ultra-filtered whey isolate per serving with zero sugar and BCAAs.",
        "tags": ["Fast Absorbing", "Zero Sugar", "30g Protein"]
    },
    {
        "id": "prod-2",
        "name": "VOLT High-Stim Igniter Pre-Workout (300g)",
        "category": "Supplements",
        "price": 1999,
        "originalPrice": 2499,
        "badge": "New Formula",
        "rating": 4.8,
        "reviews": 312,
        "image": "assets/supplements.jpg",
        "shortDesc": "Explosive focus, 350mg caffeine, 6g L-Citrulline, and clinical Beta-Alanine.",
        "tags": ["Laser Focus", "Skin-Splitting Pumps", "Electrolytes"]
    },
    {
        "id": "prod-3",
        "name": "VOLT Pure Micronized Creatine Monohydrate (500g)",
        "category": "Supplements",
        "price": 1199,
        "originalPrice": 1499,
        "badge": "Essential",
        "rating": 5.0,
        "reviews": 640,
        "image": "assets/supplements.jpg",
        "shortDesc": "100% Creapure pharmaceutical grade for maximum ATP energy and strength.",
        "tags": ["Unflavored", "100 Servings", "Strength & Power"]
    },
    {
        "id": "prod-4",
        "name": "Titan Heavy Duty 10mm Leather Powerlifting Belt",
        "category": "Gear",
        "price": 2999,
        "originalPrice": 3999,
        "badge": "IPF Spec",
        "rating": 4.9,
        "reviews": 189,
        "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
        "shortDesc": "Premium vegetable-tanned genuine leather with quick-release steel lever.",
        "tags": ["Steel Lever", "Heavy Duty", "Lifetime Warranty"]
    },
    {
        "id": "prod-5",
        "name": "Titan Forge Heavyweight Acid-Wash Pump Cover",
        "category": "Apparel",
        "price": 1299,
        "originalPrice": 1799,
        "badge": "Trending",
        "rating": 4.7,
        "reviews": 215,
        "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        "shortDesc": "280 GSM luxury combed cotton with dropped shoulders and distress wash.",
        "tags": ["Oversized Fit", "100% Combed Cotton", "Breathable"]
    },
    {
        "id": "prod-6",
        "name": "Titan Pro Figure-8 Heavy Lifting Straps",
        "category": "Gear",
        "price": 699,
        "originalPrice": 999,
        "badge": "Must Have",
        "rating": 4.8,
        "reviews": 350,
        "image": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
        "shortDesc": "Reinforced industrial stitch cotton canvas for extreme deadlifts beyond 300kg.",
        "tags": ["Extra Thick", "Deadlift Safe", "Anti-Slip"]
    },
    {
        "id": "prod-7",
        "name": "Volt Double-Wall Insulated Steel Shaker (750ml)",
        "category": "Accessories",
        "price": 899,
        "originalPrice": 1199,
        "badge": "Cold 24h",
        "rating": 4.9,
        "reviews": 172,
        "image": "assets/supplements.jpg",
        "shortDesc": "Surgical grade stainless steel with silent mixing mesh and zero odor retention.",
        "tags": ["BPA Free", "Leak Proof", "Cold All Day"]
    },
    {
        "id": "prod-8",
        "name": "Titan Pro Seamless Compression Performance Tights",
        "category": "Apparel",
        "price": 1499,
        "originalPrice": 1999,
        "badge": "Athletic",
        "rating": 4.6,
        "reviews": 140,
        "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
        "shortDesc": "Graduated compression technology to boost circulation and muscle stability.",
        "tags": ["4-Way Stretch", "Sweat Wicking", "Phone Pocket"]
    }
]


def load_local_data():
    if os.path.exists(BACKUP_FILE):
        try:
            with open(BACKUP_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for key in ["orders", "vip_leads", "memberships", "class_bookings", "reviews", "reminders", "videos", "products"]:
                    data.setdefault(key, [])
                if not data.get('products'):
                    data['products'] = [p.copy() for p in DEFAULT_PRODUCTS]
                reviews_changed = False
                for index, review in enumerate(data.get('reviews', [])):
                    if not review.get('_id'):
                        review['_id'] = f"local-review-legacy-{index}-{review.get('created_at', 'unknown').replace(' ', '-')}"
                        reviews_changed = True
                    if not review.get('status'):
                        review['status'] = 'Pending'
                        reviews_changed = True
                if reviews_changed:
                    save_local_data(data)
                return data
        except Exception:
            pass
    return {
        "orders": [],
        "vip_leads": [],
        "memberships": [],
        "class_bookings": [],
        "reviews": [],
        "reminders": [],
        "videos": [],
        "products": [p.copy() for p in DEFAULT_PRODUCTS]
    }

def save_local_data(data):
    try:
        with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("Local save error:", e)


def send_json(handler, payload, status=200, headers=None):
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json')
    for name, value in (headers or {}).items():
        handler.send_header(name, value)
    handler.end_headers()
    handler.wfile.write(json.dumps(payload, ensure_ascii=False).encode('utf-8'))


def get_google_config():
    return {
        'client_id': os.getenv('GOOGLE_CLIENT_ID', ''),
        'client_secret': os.getenv('GOOGLE_CLIENT_SECRET', '')
    }


def get_cookie(handler, name):
    for item in handler.headers.get('Cookie', '').split(';'):
        key, _, value = item.strip().partition('=')
        if key == name:
            return value
    return ''


def hash_session_token(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def create_google_session(user):
    token = secrets.token_urlsafe(32)
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    session = {'user': user, 'expires': expires_at.timestamp()}
    GOOGLE_SESSIONS[token] = session
    if mongodb_connected and mongo_db is not None:
        try:
            mongo_db['sessions'].insert_one({
                'token_hash': hash_session_token(token),
                'user': user,
                'expires_at': expires_at
            })
        except Exception as err:
            print('[MongoDB Error] Could not persist Google session:', err)
    return token


def get_google_session(handler):
    token = get_cookie(handler, 'google_session')
    if not token:
        return '', None
    session = GOOGLE_SESSIONS.get(token)
    if session and session['expires'] > time.time():
        return token, session
    GOOGLE_SESSIONS.pop(token, None)
    if mongodb_connected and mongo_db is not None:
        try:
            record = mongo_db['sessions'].find_one({
                'token_hash': hash_session_token(token),
                'expires_at': {'$gt': datetime.datetime.now(datetime.timezone.utc)}
            })
            if record:
                session = {
                    'user': record['user'],
                    'expires': record['expires_at'].timestamp()
                }
                GOOGLE_SESSIONS[token] = session
                return token, session
        except Exception as err:
            print('[MongoDB Error] Could not load Google session:', err)
    return token, None


def delete_google_session(handler):
    token = get_cookie(handler, 'google_session')
    GOOGLE_SESSIONS.pop(token, None)
    if token and mongodb_connected and mongo_db is not None:
        try:
            mongo_db['sessions'].delete_one({'token_hash': hash_session_token(token)})
        except Exception as err:
            print('[MongoDB Error] Could not delete Google session:', err)


def get_google_redirect_uri(handler):
    host = handler.headers.get('Host', f'localhost:{PORT}')
    scheme = handler.headers.get('X-Forwarded-Proto', 'http').split(',')[0].strip()
    return f'{scheme}://{host}/api/auth/google/callback'


def save_google_user(user):
    user = {
        'google_id': user.get('sub', ''),
        'name': user.get('name', ''),
        'email': user.get('email', ''),
        'picture': user.get('picture', ''),
        'updated_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    if mongodb_connected and mongo_db is not None:
        try:
            mongo_db['users'].update_one({'google_id': user['google_id']}, {'$set': user}, upsert=True)
            return user
        except Exception as err:
            print('[MongoDB Error] Could not save Google user:', err)
    local = load_local_data()
    users = local.setdefault('users', [])
    for index, existing in enumerate(users):
        if existing.get('google_id') == user['google_id']:
            users[index] = user
            save_local_data(local)
            return user
    users.append(user)
    save_local_data(local)
    return user


def get_products_list():
    """Retrieve products from MongoDB or local backup with initial seeding."""
    if mongodb_connected and mongo_db is not None:
        try:
            total_in_db = mongo_db['products'].count_documents({})
            if total_in_db == 0:
                # Seed default products into MongoDB
                for p in DEFAULT_PRODUCTS:
                    seed_item = p.copy()
                    seed_item.setdefault('created_at', datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                    mongo_db['products'].update_one({'id': seed_item['id']}, {'$set': seed_item}, upsert=True)
            
            cursor = mongo_db['products'].find()
            products = []
            for doc in cursor:
                doc['id'] = str(doc.get('id') or doc.get('_id'))
                doc['_id'] = str(doc['_id'])
                products.append(doc)
            if products:
                return products
        except Exception as e:
            print("MongoDB fetch error (products):", e)

    local = load_local_data()
    products = local.get('products', [])
    if not products:
        products = [p.copy() for p in DEFAULT_PRODUCTS]
        local['products'] = products
        save_local_data(local)
    return products


def save_or_update_product(product_data):
    """Save or update a product in MongoDB and local backup."""
    p_id = str(product_data.get('id') or f"prod-{int(time.time() * 1000)}")
    product_data['id'] = p_id
    if 'created_at' not in product_data:
        product_data['created_at'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    product_data['updated_at'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    saved_to = "local_backup"
    if mongodb_connected and mongo_db is not None:
        try:
            mongo_db['products'].update_one({'id': p_id}, {'$set': product_data}, upsert=True)
            saved_to = "mongodb"
        except Exception as e:
            print("MongoDB product save error:", e)

    local = load_local_data()
    products = local.get('products', [])
    existing_idx = next((i for i, p in enumerate(products) if str(p.get('id')) == p_id or str(p.get('_id')) == p_id), -1)
    if existing_idx >= 0:
        products[existing_idx] = product_data
    else:
        products.insert(0, product_data)
    local['products'] = products
    save_local_data(local)
    return product_data


def delete_product_record(product_id):
    """Delete a product from MongoDB and local backup."""
    p_id = str(product_id)
    deleted = False
    if mongodb_connected and mongo_db is not None:
        try:
            from bson.objectid import ObjectId
            try:
                res = mongo_db['products'].delete_one({'_id': ObjectId(p_id)})
            except Exception:
                res = mongo_db['products'].delete_one({'id': p_id})
            deleted = res.deleted_count > 0
        except Exception as e:
            print("MongoDB product delete error:", e)

    local = load_local_data()
    products = local.get('products', [])
    init_len = len(products)
    local['products'] = [p for p in products if str(p.get('id')) != p_id and str(p.get('_id')) != p_id]
    if len(local['products']) < init_len:
        deleted = True
    save_local_data(local)
    return deleted


def update_review_status(review_id, status):
    """Update review moderation state in the active database and local backup."""
    updated = False
    if mongodb_connected and mongo_db is not None:
        try:
            from bson.objectid import ObjectId
            result = mongo_db['reviews'].update_one({'_id': ObjectId(review_id)}, {'$set': {'status': status, 'moderated_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}})
            updated = result.matched_count > 0
        except Exception as e:
            print('MongoDB review update error:', e)

    local = load_local_data()
    for review in local.get('reviews', []):
        if str(review.get('_id')) == str(review_id):
            review['status'] = status
            review['moderated_at'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            updated = True
    save_local_data(local)
    return updated


def delete_video_record(video_id):
    """Delete a video from MongoDB and local backup."""
    deleted = False
    if mongodb_connected and mongo_db is not None:
        try:
            from bson.objectid import ObjectId
            try:
                res = mongo_db['videos'].delete_one({'_id': ObjectId(video_id)})
            except Exception:
                res = mongo_db['videos'].delete_one({'_id': video_id})
            deleted = res.deleted_count > 0
        except Exception as e:
            print('MongoDB video delete error:', e)

    local = load_local_data()
    videos = local.get('videos', [])
    initial_len = len(videos)
    local['videos'] = [v for v in videos if str(v.get('_id')) != str(video_id) and str(v.get('id')) != str(video_id)]
    if len(local['videos']) < initial_len:
        deleted = True
    save_local_data(local)
    return deleted


def scan_video_directory():
    """
    Scans the 'videos/' folder for category subdirectories and video files.
    Returns a list of video objects.
    """
    base_videos_dir = os.path.join(os.path.dirname(__file__), 'videos')
    if not os.path.exists(base_videos_dir):
        return []

    category_posters = {
        'students': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
        'corporate': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80',
        'night-shift': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
        'women': 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80',
        'muscle-building': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80',
        'fat-loss': 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=900&q=80',
        'mobility': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
        'cardio': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=80',
        'calisthenics': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80',
        'default': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'
    }

    category_labels = {
        'students': 'Students',
        'corporate': 'Corporate',
        'night-shift': 'Night Shift',
        'women': 'Women',
        'muscle-building': 'Muscle Building',
        'fat-loss': 'Fat Loss / HIIT',
        'mobility': 'Mobility & Yoga',
        'cardio': 'Cardio Blast',
        'calisthenics': 'Calisthenics'
    }

    valid_extensions = {'.mp4', '.webm', '.mov', '.mkv', '.m4v', '.avi'}
    scanned = []

    try:
        entries = sorted(os.listdir(base_videos_dir))
    except Exception:
        return []

    for entry in entries:
        category_path = os.path.join(base_videos_dir, entry)
        if os.path.isdir(category_path):
            cat_slug = entry.lower().replace(' ', '-')
            cat_label = category_labels.get(cat_slug, entry.replace('-', ' ').replace('_', ' ').title())
            try:
                files = sorted(os.listdir(category_path))
            except Exception:
                continue

            for f in files:
                name, ext = os.path.splitext(f)
                if ext.lower() in valid_extensions:
                    clean_title = re.sub(r'[-_]+', ' ', name).strip().title()
                    video_rel_path = f"videos/{entry}/{f}"
                    poster = category_posters.get(cat_slug, category_posters['default'])
                    scanned.append({
                        "_id": f"fs-{cat_slug}-{name}",
                        "title": clean_title,
                        "category": cat_slug,
                        "category_label": cat_label,
                        "video_url": video_rel_path,
                        "poster": poster,
                        "badge": "HD Video",
                        "description": f"Workout routine for {cat_label} track.",
                        "doc_link": "college-women-diet-plan.html",
                        "created_at": datetime.datetime.fromtimestamp(os.path.getmtime(os.path.join(category_path, f))).strftime("%Y-%m-%d %H:%M:%S")
                    })

    return scanned


def scan_cooking_videos():
    """
    Recursively scans 'videos/cooking/' directory and returns all available video files.
    """
    base_dir = os.path.join(os.path.dirname(__file__), 'videos', 'cooking')
    if not os.path.exists(base_dir):
        return []
    valid_extensions = {'.mp4', '.webm', '.mov', '.mkv', '.m4v', '.avi'}
    videos = []
    for root, _, files in os.walk(base_dir):
        for f in files:
            _, ext = os.path.splitext(f)
            if ext.lower() in valid_extensions:
                rel_path = os.path.relpath(os.path.join(root, f), os.path.dirname(__file__)).replace('\\', '/')
                videos.append({
                    "file_name": f,
                    "video_url": rel_path
                })
    return videos


def send_reminder_record(reminder):
    reminder = dict(reminder)
    reminder['status'] = 'sent'
    reminder['sent_at'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    reminder.setdefault('provider_status', 'pending')

    result = send_provider_message(reminder)
    reminder['provider_status'] = result.get('status', 'simulated')
    reminder['provider'] = result.get('provider', 'browser')
    if result.get('wa_url'):
        reminder['wa_url'] = result['wa_url']

    local = load_local_data()
    reminders = local.setdefault('reminders', [])
    for index, item in enumerate(reminders):
        if item.get('_id') == reminder.get('_id') or (
            not item.get('_id') and item.get('member_name') == reminder.get('member_name') and item.get('message') == reminder.get('message') and item.get('created_at') == reminder.get('created_at')
        ):
            reminders[index] = reminder
            break
    else:
        reminders.insert(0, reminder)
    save_local_data(local)
    return reminder


def reminder_scheduler_loop():
    while True:
        try:
            local = load_local_data()
            reminders = local.get('reminders', [])
            now = datetime.datetime.now()
            for reminder in reminders:
                if reminder.get('status') == 'sent':
                    continue
                scheduled_for = reminder.get('scheduled_for')
                if not scheduled_for:
                    continue
                try:
                    send_time = datetime.datetime.strptime(scheduled_for, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    try:
                        send_time = datetime.datetime.fromisoformat(scheduled_for)
                    except Exception:
                        continue
                if now >= send_time:
                    send_reminder_record(reminder)
        except Exception as e:
            print('Reminder scheduler error:', e)
        time.sleep(30)


class GymRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg'
    })

    def end_headers(self):
        origin = self.headers.get('Origin', '')
        allowed_origins = {
            item.strip() for item in os.getenv(
                'CORS_ORIGINS',
                'http://localhost:8000,http://127.0.0.1:8000'
            ).split(',') if item.strip()
        }
        if origin and origin in allowed_origins:
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Vary', 'Origin')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/auth/google':
            self.start_google_login()
            return
        if path == '/api/auth/google/callback':
            self.finish_google_login(parsed.query)
            return
        if path.startswith('/api/'):
            self.handle_api_get(path, parsed.query)
        else:
            # Serve regular frontend files (index.html, admin.html, etc.)
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            try:
                payload = json.loads(post_data) if post_data else {}
            except Exception:
                payload = {}
            self.handle_api_post(path, payload)
        else:
            self.send_error(404, "Not Found")

    def start_google_login(self):
        config = get_google_config()
        if not config['client_id'] or not config['client_secret']:
            send_json(self, {'error': 'Google OAuth is not configured on the server.'}, status=503)
            return
        state = secrets.token_urlsafe(24)
        GOOGLE_OAUTH_STATES[state] = time.time() + 600
        query = parse.urlencode({
            'client_id': config['client_id'],
            'redirect_uri': get_google_redirect_uri(self),
            'response_type': 'code',
            'scope': 'openid email profile',
            'state': state,
            'access_type': 'online',
            'prompt': 'select_account'
        })
        self.send_response(302)
        self.send_header('Location', f'https://accounts.google.com/o/oauth2/v2/auth?{query}')
        secure = '; Secure' if get_google_redirect_uri(self).startswith('https://') else ''
        self.send_header('Set-Cookie', f'google_oauth_state={state}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/{secure}')
        self.end_headers()

    def finish_google_login(self, query_string):
        query = parse.parse_qs(query_string)
        state = query.get('state', [''])[0]
        code = query.get('code', [''])[0]
        if not state or not code or get_cookie(self, 'google_oauth_state') != state or GOOGLE_OAUTH_STATES.pop(state, 0) < time.time():
            self.send_error(400, 'Invalid Google OAuth state')
            return
        config = get_google_config()
        token_payload = parse.urlencode({
            'code': code,
            'client_id': config['client_id'],
            'client_secret': config['client_secret'],
            'redirect_uri': get_google_redirect_uri(self),
            'grant_type': 'authorization_code'
        }).encode('utf-8')
        try:
            token_request = request.Request('https://oauth2.googleapis.com/token', data=token_payload, method='POST')
            with request.urlopen(token_request, timeout=12) as response:
                token_data = json.loads(response.read().decode('utf-8'))
            user_request = request.Request('https://openidconnect.googleapis.com/v1/userinfo')
            user_request.add_header('Authorization', f"Bearer {token_data['access_token']}")
            with request.urlopen(user_request, timeout=12) as response:
                user = save_google_user(json.loads(response.read().decode('utf-8')))
        except Exception as err:
            print('[Google OAuth Error]:', err)
            self.send_error(502, 'Google login failed')
            return
        session = create_google_session(user)
        self.send_response(302)
        self.send_header('Location', '/')
        secure = '; Secure' if get_google_redirect_uri(self).startswith('https://') else ''
        self.send_header('Set-Cookie', f'google_session={session}; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/{secure}')
        self.end_headers()

    def do_PATCH(self):
        parsed = urlparse(self.path)
        if parsed.path != '/api/reviews':
            self.send_error(404, "Not Found")
            return
        content_length = int(self.headers.get('Content-Length', 0))
        try:
            payload = json.loads(self.rfile.read(content_length).decode('utf-8'))
        except Exception:
            payload = {}
        review_id = str(payload.get('id') or '').strip()
        status = str(payload.get('status') or '').strip().title()
        if not review_id or status not in {'Approved', 'Rejected'}:
            self.send_error(400, "Review id and valid status are required")
            return
        updated = update_review_status(review_id, status)
        self.send_response(200 if updated else 404)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'success': updated, 'status': status}).encode('utf-8'))

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == '/api/videos':
            query = dict(part.split('=', 1) for part in parsed.query.split('&') if '=' in part)
            video_id = query.get('id')
            if not video_id:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    try:
                        payload = json.loads(self.rfile.read(content_length).decode('utf-8'))
                        video_id = payload.get('id') or payload.get('_id')
                    except Exception:
                        pass
            if not video_id:
                send_json(self, {"error": "Missing video ID"}, status=400)
                return
            deleted = delete_video_record(video_id)
            send_json(self, {"success": deleted})
            return
        if path == '/api/products':
            query = dict(part.split('=', 1) for part in parsed.query.split('&') if '=' in part)
            product_id = query.get('id')
            if not product_id:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    try:
                        payload = json.loads(self.rfile.read(content_length).decode('utf-8'))
                        product_id = payload.get('id') or payload.get('_id')
                    except Exception:
                        pass
            if not product_id:
                send_json(self, {"error": "Missing product ID"}, status=400)
                return
            deleted = delete_product_record(product_id)
            send_json(self, {"success": deleted})
            return
        self.send_error(404, "Not Found")

    def handle_api_get(self, path, query_string=''):
        response_data = []

        if path == '/api/auth/config':
            send_json(self, {'configured': bool(get_google_config()['client_id'])})
            return

        if path == '/api/auth/me':
            _, session = get_google_session(self)
            if not session:
                send_json(self, {'authenticated': False})
                return
            send_json(self, {'authenticated': True, 'user': session['user']})
            return

        if path == '/api/status':
            send_json(self, {
                "status": "online",
                "mongodb_connected": mongodb_connected,
                "database_name": DB_NAME,
                "timestamp": datetime.datetime.now().isoformat()
            })
            return

        if path == '/api/admin/email-config':
            cfg = get_email_config()
            send_json(self, {
                "admin_email": cfg['admin_email'],
                "smtp_user": cfg['smtp_user'],
                "smtp_enabled": cfg['smtp_enabled'],
                "has_password": bool(cfg['smtp_pass'])
            })
            return

        if path == '/api/products':
            send_json(self, get_products_list())
            return

        collection_map = {
            '/api/orders': 'orders',
            '/api/leads': 'vip_leads',
            '/api/memberships': 'memberships',
            '/api/bookings': 'class_bookings',
            '/api/reviews': 'reviews',
            '/api/reminders': 'reminders',
            '/api/videos': 'videos'
        }

        if path == '/api/reminders/send':
            send_json(self, {'success': True, 'status': 'scheduled'})
            return

        if path == '/api/cooking-videos':
            send_json(self, scan_cooking_videos())
            return

        coll_name = collection_map.get(path)
        if coll_name:
            if coll_name == 'videos':
                scanned_vids = scan_video_directory()
                seen_urls = {v.get('video_url') for v in scanned_vids}
                custom_vids = []
                if mongodb_connected and mongo_db is not None:
                    try:
                        cursor = mongo_db['videos'].find().sort('_id', -1).limit(100)
                        for doc in cursor:
                            doc['_id'] = str(doc['_id'])
                            custom_vids.append(doc)
                    except Exception as e:
                        print("MongoDB fetch error (videos):", e)
                        local = load_local_data()
                        custom_vids = local.get('videos', [])
                else:
                    local = load_local_data()
                    custom_vids = local.get('videos', [])

                response_data = list(scanned_vids)
                for cv in custom_vids:
                    v_url = cv.get('video_url', '')
                    if v_url not in seen_urls:
                        # Include if external link or file exists
                        if v_url.startswith('http') or os.path.exists(os.path.join(os.path.dirname(__file__), v_url)):
                            response_data.append(cv)
                            seen_urls.add(v_url)
            elif mongodb_connected and mongo_db is not None:
                try:
                    cursor = mongo_db[coll_name].find().sort('_id', -1).limit(100)
                    for doc in cursor:
                        doc['_id'] = str(doc['_id'])
                        response_data.append(doc)
                except Exception as e:
                    print(f"MongoDB fetch error ({coll_name}):", e)
                    local = load_local_data()
                    response_data = local.get(coll_name, [])
            else:
                local = load_local_data()
                response_data = local.get(coll_name, [])

            if coll_name == 'reviews' and query_string:
                query = dict(part.split('=', 1) for part in query_string.split('&') if '=' in part)
                location_id = query.get('location_id')
                if location_id:
                    response_data = [review for review in response_data if review.get('location_id') == location_id and review.get('status') == 'Approved']

        send_json(self, response_data)

    def handle_api_post(self, path, payload):
        payload['created_at'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if path == '/api/auth/logout':
            delete_google_session(self)
            send_json(self, {'success': True}, headers={
                'Set-Cookie': 'google_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/'
            })
            return

        if path == '/api/admin/email-config':
            success = save_email_config(payload)
            send_json(self, {"success": success})
            return

        if path == '/api/admin/send-test-email':
            test_target = payload.get('email') or get_email_config()['admin_email']
            sub = "⚡ Titan Forge - Live Email Notification Test"
            body = f"""Hello Sachin,

This is a test notification from your Titan Forge Gym Website system!

Your Gmail ({test_target}) is successfully connected to receive live customer enquiries, VIP passes, memberships, coach bookings, and store orders.

Timestamp: {payload['created_at']}
"""
            sent = send_admin_email_alert(sub, body)
            send_json(self, {"success": sent, "target": test_target})
            return

        if path == '/api/videos/delete':
            video_id = payload.get('id') or payload.get('_id')
            deleted = delete_video_record(video_id) if video_id else False
            send_json(self, {"success": deleted})
            return

        if path == '/api/products/delete':
            product_id = payload.get('id') or payload.get('_id')
            deleted = delete_product_record(product_id) if product_id else False
            send_json(self, {"success": deleted})
            return

        if path == '/api/products':
            saved_prod = save_or_update_product(payload)
            send_json(self, {"success": True, "product": saved_prod})
            return

        if path == '/api/reviews':
            payload['status'] = 'Pending'

        if path == '/api/reminders/send':
            reminder = payload.copy()
            reminder['status'] = 'sent'
            reminder['sent_at'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            reminder['scheduled_for'] = reminder.get('scheduled_for') or reminder.get('reminder_date') or datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            sent = send_reminder_record(reminder)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "sent": sent, "status": "sent"}).encode('utf-8'))
            return

        collection_map = {
            '/api/orders': 'orders',
            '/api/leads': 'vip_leads',
            '/api/memberships': 'memberships',
            '/api/bookings': 'class_bookings',
            '/api/reviews': 'reviews',
            '/api/reminders': 'reminders',
            '/api/videos': 'videos'
        }

        coll_name = collection_map.get(path)
        if not coll_name:
            self.send_error(404, "Endpoint Not Found")
            return

        saved_to = "local_backup"
        doc_id = None

        # 1. Save to MongoDB if online
        if mongodb_connected and mongo_db is not None:
            try:
                res = mongo_db[coll_name].insert_one(payload.copy())
                doc_id = str(res.inserted_id)
                saved_to = "mongodb"
                print(f"[MongoDB] Inserted 1 document into '{coll_name}': ID {doc_id}")
            except Exception as e:
                print(f"[MongoDB Error] Could not insert into '{coll_name}':", e)

        # 2. Always persist to local backup for resilience
        local = load_local_data()
        if coll_name not in local:
            local[coll_name] = []
        local_payload = payload.copy()
        if doc_id:
            local_payload['_id'] = doc_id
        elif coll_name == 'reviews':
            local_payload['_id'] = f"local-review-{int(time.time() * 1000)}"
        local[coll_name].insert(0, local_payload)
        save_local_data(local)

        # 3. Trigger live email alert to Gym Owner
        try:
            dispatch_enquiry_notification(coll_name, payload)
        except Exception as e:
            print("[Notification Dispatch Error]:", e)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "success": True,
            "saved_to": saved_to,
            "collection": coll_name,
            "id": doc_id or local_payload.get('_id') or "local-" + str(len(local[coll_name]))
        }).encode('utf-8'))


if __name__ == '__main__':
    os.chdir(os.path.dirname(__file__))
    scheduler = threading.Thread(target=reminder_scheduler_loop, daemon=True)
    scheduler.start()
    # Allow port reuse and handle requests with multi-threading
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("", PORT), GymRequestHandler) as httpd:
        print(f"[*] TITAN FORGE Server is running on: http://localhost:{PORT}")
        print(f"[*] Admin Dashboard available at:    http://localhost:{PORT}/admin.html")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

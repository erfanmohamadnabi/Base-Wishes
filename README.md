# Base Wishes

Base Wishes is a simple on-chain social dApp built on Base.

It allows users to publicly record their plans and wishes before a potential Base ecosystem airdrop. By connecting their wallet, users can publish a short note describing what they intend to do with their tokens if they receive an airdrop.

All wishes are publicly visible, creating a transparent and community-driven archive of hopes, plans, and predictions.

## Features

* Connect wallet with MetaMask
* Sign in using wallet authentication
* Publish wishes on Base
* Store transaction hashes on-chain
* Public feed of all wishes
* User profiles
* Edit profile information
* View wishes from other community members

## Tech Stack

### Frontend

* React
* React Router
* Ethers.js
* Vite

### Backend

* Django
* Django REST Framework
* JWT Authentication

### Blockchain

* Base
* Solidity
* Ethers.js

### Database

* PostgreSQL

## How It Works

1. Connect your wallet.
2. Sign a message to authenticate.
3. Submit a wish describing your plans for a future Base airdrop.
4. The wish is recorded and associated with your wallet.
5. Explore wishes from other users across the ecosystem.

## Example Wish

> "If I receive a Base airdrop, I'll use 50% to support builders on Base and keep the rest for long-term ecosystem participation."

## Local Development

### Backend

```bash
cd backend

python -m venv venv
pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend

npm install
npm run dev
```

## Vision

Base Wishes aims to capture the optimism, creativity, and expectations of the Base community before major ecosystem events.

A public time capsule of what people planned to do before receiving their tokens.

## License

MIT License

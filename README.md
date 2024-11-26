# Akash Chat UI (Forked from Huggingface's Chat UI)

![Akash Chat UI repository thumbnail](https://raw.githubusercontent.com/jhuang314/akash-chat-ui/refs/heads/main/image.png)

A fork on the amazing Huggingface Chat UI that natively supports the Akash network!

0. [Quickstart Docker Build](#quickstart-docker-build)
1. [Quickstart Deployment to Akash Network](#quickstart-deployment-to-akash-network)
2. [Running locally](#running-locally)
3. [Akash customizations on top of Huggingface](#akash-customizations-on-top-of-huggingface)

## Quickstart Docker Build

Here are the instructions for building your own Docker image from this repository and pushing it to Docker Hub.

**Step 1 (Install dependencies)**

Install the following programs if necessary:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- git

Clone this repository:

```bash
git clone https://github.com/jhuang314/akash-chat-ui
cd akash-chat-ui
```

Install playwright to support local websearch:

```bash
sudo npx playwright install-deps
```

Build the docker image:

```bash
docker build -t my-username/my-image:my-tag .

# An explicit example:
docker build -t jh3141/akash-chat-ui:0.0.26 .
```

Push the docker image to docker hub

```bash
docker push my-username/my-image:my-tag

# An explicit example:
docker push jh3141/akash-chat-ui:0.0.26
```

## Quickstart Deployment to Akash Network

Here are the instructions for taking a Docker image and deploying it to the Akash Network!

**Step 1 (Copy the YAML SDL config)**

Copy and modify the following SDL file (but replace `<YOUR_AKASH_CHAT_API_KEY>` with your actual Akash API key).
If you want to enable web searching, set the appropriate environment variable with your search api key:

```bash
YDC_API_KEY=#your docs.you.com api key here
SERPER_API_KEY=#your serper.dev api key here
SERPAPI_KEY=#your serpapi key here
SERPSTACK_API_KEY=#your serpstack api key here
SEARCHAPI_KEY=#your searchapi api key here
USE_LOCAL_WEBSEARCH=#set to true to parse google results yourself, overrides other API keys
SEARXNG_QUERY_URL=# where '<query>' will be replaced with query keywords see https://docs.searxng.org/dev/search_api.html eg https://searxng.yourdomain.com/search?q=<query>&engines=duckduckgo,google&format=json
BING_SUBSCRIPTION_KEY=#your key
```

If you built and pushed your own Docker image, feel free to replace `jh3141/akash-chat-ui:0.0.26` with your own.

```yaml
---
version: "2.0"
services:
  web:
    image: jh3141/akash-chat-ui:0.0.26
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
    env:
      - AKASH_API_KEY=<YOUR_AKASH_CHAT_API_KEY>
      - SERPER_API_KEY=<SERPER_API_KEY>
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 16
        memory:
          size: 8Gi
        storage:
          - size: 5Gi
  placement:
    akash:
      pricing:
        web:
          denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
          amount: 10000
      signedBy:
        anyOf: []
        allOf:
          - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
deployment:
  web:
    akash:
      profile: web
      count: 1
```

**Step 2 (Deploy to Akash console)**

1. Go to the Akash console: https://console.akash.network/, and click on Deploy. Feel free to activate the $10 trial to get some funds.
1. Click on Deploy
1. Choose "Build your template"
1. Switch from "Builder" tab to "YAML" tab
1. Paste the whole YAML SDL file from above
1. Click "Create Deployment ->", and Confirm
1. Pick a provider, and "Accept Bid ->"
1. Wait a bit
1. On the "Leases" tab, open the URI(s) link
1. Enjoy using Huggingface's Chat UI, powered by Akash's Chat API!

## Running Locally

**Step 1 (make sure you have MongoDb running locally):**

```bash
docker run -d -p 27017:27017 --name mongo-chatui mongo:latest
```

**Step 2 (clone this repo if you haven't already):**

```bash
git clone https://github.com/jhuang314/akash-chat-ui
cd akash-chat-ui
```

**Step 3 (start chat-ui):**

```bash
git clone https://github.com/jhuang314/akash-chat-ui
cd akash-chat-ui
npm install
npm run dev -- --open
```

## Akash customizations on top of Huggingface

Let's look at the `.env` file.

Huggingface exposes a `MODELS` environment variable, which contains an array of model configurations.
For each model, we can define the model name, displayName, endpoints, and sample prompts.
Huggingface supports modifying the `baseURL` and api keys for the `openai` model type; however, it is cumbersome to define this large block of json in 1 variable.

The solution is to define a new [`src/lib/server/endpoints/akash/endpointAkash.ts`](https://github.com/jhuang314/akash-chat-ui/blob/main/src/lib/server/endpoints/akash/endpointAkash.ts)
, which contains native configurations for Akash.
This also allows us to define a new `AKASH_API_KEY` environment variable to hold the api keys.
Finally, it allows us to provide defaults for the `baseURL` for Akash Chat API.

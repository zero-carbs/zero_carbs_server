FROM node:22
RUN mkdir -p /app/server
WORKDIR /app/server
COPY package.json .
ARG CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY HD_BIND LCS HD_ID
ENV CSK=$CLERK_SECRET_KEY
ENV CPK=$CLERK_PUBLISHABLE_KEY 
ENV HD_BIND=$HD_BIND 
ENV LCS=$LCS 
ENV HD_ID=$HD_ID
COPY init_wrangler.sh .
RUN chmod +x init_wrangler.sh && ./init_wrangler.sh
RUN npm install
COPY . .
EXPOSE 8787

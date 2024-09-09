#!/bin/bash

name="zero_carbs_server"
compatibility_date="2023-12-01"
node_compat=true
binding="${HD_BIND}"
id="${HD_ID}"
local_connection_string="${LCS}"
clerk_secret_key="${CSK}"
clerk_publishable_key="${CPK}"

# Generate the wrangler.toml file
cat > wrangler.toml <<EOF
name = "${name}"
compatibility_date = "${compatibility_date}"
node_compat = ${node_compat}

[[hyperdrive]]
binding = "${binding}"
id = "${id}"
localConnectionString = "${local_connection_string}"

[vars]
CLERK_SECRET_KEY = "${clerk_secret_key}"
CLERK_PUBLISHABLE_KEY = "${clerk_publishable_key}"
LCS="${local_connection_string}"
EOF

echo "wrangler.toml file generated successfully."

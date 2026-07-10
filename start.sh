#!/bin/bash
set -e

MYSQL_BIN=/nix/store/s2lbn1axpc79kwnc829k5idkwabfq459-mysql-8.0.42/bin
MYSQL_DATA=/home/runner/mysql_data
MYSQL_SOCKET=/tmp/mysql.sock

echo "[Clientum] Starting MySQL..."

# Kill any existing MySQL
pkill -f mysqld || true
sleep 1
rm -f $MYSQL_SOCKET $MYSQL_SOCKET.lock /tmp/mysql.pid

# Init data dir if needed
if [ ! -d "$MYSQL_DATA/mysql" ]; then
  echo "[Clientum] Initializing MySQL data directory..."
  $MYSQL_BIN/mysqld --initialize-insecure --datadir=$MYSQL_DATA --user=$(whoami) 2>&1
fi

# Start MySQL in background
$MYSQL_BIN/mysqld \
  --datadir=$MYSQL_DATA \
  --socket=$MYSQL_SOCKET \
  --port=3306 \
  --pid-file=/tmp/mysql.pid \
  --log-error=/tmp/mysql-error.log \
  --mysqlx=OFF \
  --user=$(whoami) &

MYSQL_PID=$!
echo "[Clientum] MySQL PID: $MYSQL_PID"

# Wait for MySQL socket
MAX_WAIT=30
COUNT=0
echo "[Clientum] Waiting for MySQL to be ready..."
while [ ! -S $MYSQL_SOCKET ] && [ $COUNT -lt $MAX_WAIT ]; do
  sleep 1
  COUNT=$((COUNT + 1))
done

if [ ! -S $MYSQL_SOCKET ]; then
  echo "[Clientum] MySQL failed to start. Logs:"
  cat /tmp/mysql-error.log 2>/dev/null | tail -20
  exit 1
fi

echo "[Clientum] MySQL is ready!"

# Setup database
echo "[Clientum] Setting up database..."
$MYSQL_BIN/mysql -S $MYSQL_SOCKET -u root < /home/runner/workspace/php/setup.sql 2>&1 || echo "[Clientum] DB already set up or error (continuing)"

echo "[Clientum] Starting PHP server on port 5000..."
cd /home/runner/workspace/php
php -S 0.0.0.0:5000 index.php

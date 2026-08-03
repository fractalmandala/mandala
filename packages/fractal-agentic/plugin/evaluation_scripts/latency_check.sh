#!/bin/bash
# Latency Tracking Check Script
# This script simulates running a task multiple times and records execution time.

NUM_RUNS=$1 # Number of times to run the test
if [ -z "$NUM_RUNS" ]; then
    echo "Usage: $0 <number_of_runs>"
    exit 1
fi

echo "--- Starting Latency Test for $NUM_RUNS runs ---"

TOTAL_TIME=0
for i in $(seq 1 $NUM_RUNS);
do
    START_TIME=$(date +%s.%N)
    
    # Placeholder for actual orchestration task execution command
    # In a real setup, this would be 'orchestrator run task_id' or similar.
    sleep 1 # Simulate a typical task duration (e.g., 1 second)
    
    END_TIME=$(date +%s.%N)
    DURATION=$(echo "$END_TIME - $START_TIME" | bc)
    
    TOTAL_TIME=$(echo "$TOTAL_TIME + $DURATION" | bc)
    echo "Run $i completed in ${DURATION} seconds."
done

AVERAGE_LATENCY=$(echo "$TOTAL_TIME / $NUM_RUNS" | bc)

echo "\n=============================="
echo "Latency Test Complete."
echo "Total Runs: $NUM_RUNS"
echo "Average Latency: ${AVERAGE_LATENCY} seconds"
echo "=============================="

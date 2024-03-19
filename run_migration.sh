#!/bin/bash

# Migrate AUTH
echo "Migrate target: AUTH"

vbmigration up AUTH

if [ $? -ne 0 ]; then
    echo "Failed to run migration. Target: AUTH"
    echo "Exit 1"
    exit 1
fi

# Migrate MAIN
echo "Migrate target: MAIN"

vbmigration up MAIN

if [ $? -ne 0 ]; then
    echo "Failed to run migration. Target: MAIN"
    echo "Exit 1"
    exit 1
fi


# Migrate BUILD
echo "Migrate target: BUILD"

vbmigration up BUILD

if [ $? -ne 0 ]; then
    echo "Failed to run migration. Target: BUILD"
    echo "Exit 1"
    exit 1
fi
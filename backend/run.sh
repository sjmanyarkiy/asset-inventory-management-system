#!/bin/bash
lsof -ti :5001 | xargs kill -9 2>/dev/null
python main.py

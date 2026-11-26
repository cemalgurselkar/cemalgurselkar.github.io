---
title: Clearpath with Language Models
description: A simulated mobile-manipulation workflow connecting constrained natural-language planning to perception, navigation, and grasp-control nodes in ROS 2.
repo: cemalgurselkar/Clearpath_with_LanguageModels
technologies: [ROS 2, Gazebo, Ollama, Ultralytics YOLO, Python]
featured: false
order: 4
draft: false
links:
  - label: README and node diagram
    url: https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/blob/67a01979193c7fcda9b8e116d948604162d1720a/README.md
  - label: ROS package source
    url: https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/tree/67a01979193c7fcda9b8e116d948604162d1720a/src/llm_robot
  - label: Navigation implementation
    url: https://github.com/cemalgurselkar/Clearpath_with_LanguageModels/blob/67a01979193c7fcda9b8e116d948604162d1720a/src/llm_robot/llm_robot/navigator.py
---

## Overview

A constrained local model converts an English command into a small task schema. ROS 2 nodes then handle scanning, detection, visual-servo navigation, alignment, and arm control inside Gazebo simulation.

## Limitations

- This is a simulation, not evidence of physical deployment.
- No repeatable end-to-end success rate is published.

import google.generativeai as genai
import pathlib
import textwrap
import os
import streamlit as st
import random

@st.cache_resource
def get_model():
   # Or use `os.getenv('GOOGLE_API_KEY')` to fetch an environment variable.
    GOOGLE_API_KEY=os.environ.get('GOOGLE_API_KEY')

    genai.configure(api_key=GOOGLE_API_KEY)

    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
    model = genai.GenerativeModel('gemini-pro')
    return model
    
   
def to_markdown(text):
  text = text.replace('•', '  *')
  return textwrap.indent(text, '> ', predicate=lambda _: True)

CRAZY_PROMPT ="""
Wrap the following piece of text in a html that allows
one to best reflect their emotion and tone.
The styling of the text is critical and should implicitly convey the emotion/tone of the text.
DO NOT add any unneccesary css and html.
Be creative. The html will be run in a text messaging interface that supports html and css. 
Add animations using css and simple javascript wherever applicable. 
Add emojis wherever applicable.
DO NOT change the text. only add styling. Keep the output within a div container with class message.
Do not assume that a css exists. Add any css that is required for the styling. Add all css within the div.
Any css should only affect the content within div and should not affect any other html.
Wrap the overall output within ```html```.
Animation level on a scale of 1 (min) to 10 (max): {animation_level}.
An animation level of 1 would mean no animations and 10 would be mean that you have all sorts of crazy animation.
The animation should strictly only apply to content within the div.
------
Input text:
{message}
------
"""

EMOJIFY_PROMPT ="""
Add an emoji (or a couple of emojis) to the piece of text that most accurately describes the emotion of the text.
Return the text with the emoji.
------
Input text:
{message}
------
"""

emotions = [
    "Joy",
    "Sadness",
    "Anger",
    "Fear",
    "Surprise",
    "Disgust",
    "Love",
    "Hate",
    "Excitement",
    "Contentment",
    "Guilt",
    "Shame",
    "Pride",
    "Jealousy",
    "Envy",
    "Compassion",
    "Empathy",
    "Sympathy",
    "Anxiety",
    "Relief"
]

tones = [
    "Formal",
    "Informal",
    "Humorous",
    "Serious",
    "Sarcastic",
    "Playful",
    "Authoritative",
    "Persuasive",
    "Sympathetic",
    "Objective",
    "Subjective",
    "Optimistic",
    "Pessimistic",
    "Confident",
    "Doubtful",
    "Encouraging",
    "Discouraging",
    "Neutral",
    "Casual",
    "Intense"
]


ACCESSIBILITY_PROMPT = """
You have the following list of {class_type}s.

{classes}

Provide the most accurate emotion for the following piece of text:
-----
{message}
-----
"""


def call_gemini(message, message_type, animation_level=1):
    model = get_model()
    if message_type == 'Keep it simple':
        return message
    elif message_type == 'Emojify':
        response = model.generate_content(EMOJIFY_PROMPT.format(message=message),
                                          generation_config={'temperature': 0.5})
    else:
        response = model.generate_content(CRAZY_PROMPT.format(message=message,
                                                              animation_level=animation_level),
                                          generation_config={'temperature': 0.5})
    print(response.text)
    
    text = response.text
    if '```html' in text:
        text = text.replace('```html','').replace('```','')
    
    idx = random.randint(0, 1000)
    text = text.replace('message', f'message{idx}')
    print(text)
    return text

def enhance_message(message):
    model = get_model()
    emotion = model.generate_content(ACCESSIBILITY_PROMPT.format(class_type='emotion',
                                                                  classes=", ".join(emotions),
                                                                  message=message)).text
    tone = model.generate_content(ACCESSIBILITY_PROMPT.format(class_type='tone',
                                                                  classes=", ".join(tones),
                                                                  message=message)).text
    return emotion, tone


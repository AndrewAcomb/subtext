import streamlit as st
import time
from collections import defaultdict
from generate import call_gemini, enhance_message
import base64

@st.cache_data
def get_base64_of_bin_file(bin_file):
    with open(bin_file, 'rb') as f:
        data = f.read()
    return base64.b64encode(data).decode()

def set_png_as_page_bg(png_file):
    bin_str = get_base64_of_bin_file(png_file)
    page_bg_img = '''
    <style>
    background-image: url("data:image/png;base64,%s");
    background-size: cover;
    </style>
    ''' % bin_str
    
    return page_bg_img


st.set_page_config(layout="wide")
mock_iphone = get_base64_of_bin_file('iphone_mock.png')
mock_android = get_base64_of_bin_file('android_mock.png')
st.write('<div style="text-align: center;font-size: 20px; font-style: italic;"> <p style="text-align: center;font-weight: bold; font-size: 50px; font-style: italic;">Subtext </p> - Reimagine Texting</div>',
         unsafe_allow_html=True
         )
st.divider()
person1, person2 = st.columns(2, gap='small')
if "chat_history" not in st.session_state:
    st.session_state["chat_history"] = defaultdict(list)

message_type = st.sidebar.radio('Style options', options=['Keep it simple', 'Go Crazy', 'Emojify'])
if message_type == 'Go Crazy':
    animation_level = st.sidebar.slider('Craziness level', min_value=1, max_value=10)
else:
    animation_level = 1
enhance_mode = st.sidebar.checkbox('Accessibility Mode')
refresh = st.sidebar.button('Refresh Chat')
if refresh:
    st.session_state["chat_history"].clear()

with person1:
    st.write('<div style="text-align: center;font-weight: bold; font-style: italic;">Tanmay</div>', unsafe_allow_html=True)
    st.markdown(
        '''
        <style>
            div[data-testid="container"] {
                position: relative;
                flex-direction: row-reverse;
                background-image: url("data:image/png;base64,%s");
                background-size: cover;
            }
        </style>
        ''' % mock_iphone,
            unsafe_allow_html=True,
        )
                
    if prompt := st.chat_input("Say something", key='person1'):
        
        stylized_user_input = call_gemini(message=prompt,
                                            message_type=message_type,
                                            animation_level=animation_level)
        st.session_state["chat_history"]['person1'].append(
            {"role": "user", "content": stylized_user_input},
        )
        st.session_state["chat_history"]['person2'].append(
            {"role": "assistant", "content": stylized_user_input},
        )
        if enhance_mode:
            emotion, tone = enhance_message(stylized_user_input)
            st.session_state["chat_history"]['person2'].append(
            {"role": "assistant", "content": f'<p style="text-align: center; font-style: italic;"> Gemini: Emotion: {emotion}, Tone: {tone}</p>'})
    for i in st.session_state["chat_history"]['person1']:
        with st.chat_message(name=i["role"], avatar='A_logo.png' if i["role"]=="assistant" else 'T_logo.png'):
            if 'content' in i:
                st.write(i["content"], unsafe_allow_html=True)
        
with person2:
    st.write('<div style="text-align: center;font-weight: bold; font-style: italic;">Andrew</div>', unsafe_allow_html=True)
    st.markdown(
            '''
            <style>
                div[data-testid="column"] {
                    position: relative;
                    flex-direction: row-reverse;
                    background-image: url("data:image/png;base64,%s");
                    background-size: cover;
                }
            </style>
            ''' % mock_iphone,
                unsafe_allow_html=True,
            )
    if prompt := st.chat_input("Say something", key='person2'):
        stylized_user_input = call_gemini(prompt, message_type)
        st.session_state["chat_history"]['person2'].append(
            {"role": "user", "content": stylized_user_input},
        )
        st.session_state["chat_history"]['person1'].append(
            {"role": "assistant", "content": stylized_user_input},
        )
        person1.chat_message('assistant', 
                             avatar='T_logo.png').write(stylized_user_input, unsafe_allow_html=True)
        # if enhance_mode:
        #     emotion, tone = enhance_message(stylized_user_input)
        #     st.session_state["chat_history"]['person1'].append(
        #     {"role": "assistant", "content": f'<p style="text-align: center; font-style: italic;>Emotion: {emotion}, Tone: {tone}</p>'})
    for i in st.session_state["chat_history"]['person2']:
        with st.chat_message(name=i["role"], avatar='T_logo.png' if i["role"]=="assistant" else 'A_logo.png'):
            if 'content' in i:
                st.write(i["content"], unsafe_allow_html=True)
    

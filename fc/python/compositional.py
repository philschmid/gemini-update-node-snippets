turn_on_the_lights_schema = {"name": "turn_on_the_lights"}
turn_off_the_lights_schema = {"name": "turn_off_the_lights"}

prompt = """
    Hey, can you write run some python code to turn on the lights, wait 10s and then turn off the lights?
    """

tools = [
    {"code_execution": {}},
    {"function_declarations": [turn_on_the_lights_schema, turn_off_the_lights_schema]},
]

await run(prompt, tools=tools, modality="AUDIO")

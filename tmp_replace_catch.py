from pathlib import Path
path = Path('src/app/api/plans/generate-ai/route.ts')
data = path.read_text()
old = '''  } catch (error) {\r\n    console.error(error);\r\n    return NextResponse.json(\r\n      { error: error instanceof Error ? error.message :  Unable to generate plan },\r\n      { status: 500 }\r\n    );\r\n  }\r\n'''
new = '''  } catch (error) {\r\n    console.error(error);\r\n    return NextResponse.json(\r\n      { error: Plan generation failed. Please try again., code: AI_GENERATION_FAILED },\r\n      { status: 500 }\r\n    );\r\n  }\r\n'''
if old not in data:
    raise SystemExit('old block not found')
data = data.replace(old, new, 1)
path.write_text(data)

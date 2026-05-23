import subprocess
import os

cwd = "/home/adi/project"

def run(cmd):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    print("STDOUT:", res.stdout)
    print("STDERR:", res.stderr)
    return res.returncode

# Get log to see what's happening
run("git log -n 5 --oneline")

# Reset to origin/main (keeps working directory changes!)
run("git reset origin/main")

# Add the cleaned files
run("git add .")

# Commit
run('git commit -m "Deploy: clean render.yaml and update ai-service CORS"')

# Push
run("git push origin main")

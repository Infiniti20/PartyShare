.PHONY: run

# Python/CSharp Named Pipes IPC
# from https://stackoverflow.com/questions/57056598/named-pipes-ipc-python-server-c-sharp-client
run:
	run-project -l python3 &\
  run-project -l nodejs
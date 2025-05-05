// client.js
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["server.js"]
  });

  const client = new Client({
    name: "JSKIM-MCP-CLIENT",
    version: "1.0.1"
  });

  try {
    await client.connect(transport);
    console.log("Connected to server!");

    // 툴 목록 확인
    const tools = await client.listTools();
    console.log("Available tools:", tools);

    // add 툴 호출
    const addResult = await client.callTool({
      name: "add",
      arguments: {
        a: 5,
        b: 3
      }
    });
    console.log("Add result:", addResult);

    // 리소스 목록 확인
    const resources = await client.listResources();
    console.log("Available resources:", resources);

    // greeting 리소스 읽기
    const greeting = await client.readResource({
      uri: "greeting://John"
    });
    console.log("Greeting resource:", greeting);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    transport.close();
  }
}

main();
# Redmine MCP 서버
[![smithery badge](https://smithery.ai/badge/@ksyrang/redmine-mcp-server)](https://smithery.ai/server/@ksyrang/redmine-mcp-server)

Model Context Protocol을 통해 Redmine API와 통합되는 서버입니다. Claude와 같은 MCP 클라이언트와 함께 사용할 수 있습니다.

## 로컬 설치

```bash
npx redmine-mcp-server
```

### Installing via Smithery

To install Redmine Integration Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@ksyrang/redmine-mcp-server):

```bash
npx -y @smithery/cli install @ksyrang/redmine-mcp-server --client claude
```

## Claude 구성  예시
{
  "mcpServers": {
    "redmine": {
      "command": "npx",
      "args": ["redmine-mcp-server"],
      "env": {
        "REDMINE_BASE_URL": "your-redmine-url",
        "REDMINE_API_KEY": "your-api-key"
      }
    }
  }
}

## 지원되는 기능

이슈 목록 조회
특정 이슈 상세 조회
프로젝트 목록 조회

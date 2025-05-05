# Redmine MCP 서버

Model Context Protocol을 통해 Redmine API와 통합되는 서버입니다. Claude와 같은 MCP 클라이언트와 함께 사용할 수 있습니다.

## 로컬 설치

```bash
npx redmine-mcp-server
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
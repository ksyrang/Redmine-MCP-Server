// redmine-mcp-server.js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// 환경변수에서 서버 설정 가져오기
let baseUrl = process.env.REDMINE_BASE_URL;
// URL 형식 확인 및 수정 - 프로토콜이 없으면 https:// 추가
if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  baseUrl = 'https://' + baseUrl;
}

const serverConfig = {
  baseUrl: baseUrl,
  apiKey: process.env.REDMINE_API_KEY
};

// 환경변수 검증
if (!serverConfig.baseUrl || !serverConfig.apiKey) {
  console.error("경고: REDMINE_BASE_URL 또는 REDMINE_API_KEY 환경변수가 설정되지 않았습니다.");
  console.error("이 경우 initialize 툴을 사용하여 수동으로 설정해야 합니다.");
}

// 서버 초기화 함수
async function initializeServer(baseUrl, apiKey) {
  try {
    // 둘 다 존재하면 연결 시도
    if (baseUrl && apiKey) {
      const response = await fetch(`${baseUrl}/users/current.json`, {
        headers: {
          "X-Redmine-API-Key": apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 연결 실패: ${response.status} ${response.statusText}`);
      }
      
      console.info(`Redmine 서버(${baseUrl})에 성공적으로 연결되었습니다.`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Redmine 서버 연결 실패: ${error.message}`);
    return false;
  }
}

// MCP 서버 생성
const server = new McpServer({
  name: "Redmine-MCP-Server",
  version: "1.1.0"
});

// 이슈 목록 조회 툴
server.tool(
  "getIssues",
  "Retrieves a list of issues from Redmine. Supports filtering by project, status, assignee, and more, as well as sorting and pagination. Returns basic information for each issue, including ID, subject, description, status, priority, assignee, author, creation date, and update date. Parameters: project_id, status_id, assigned_to_id, tracker_id, sort, limit, offset.",
  {
    project_id: z.string().optional(),
    status_id: z.string().optional(),
    tracker_id: z.string().optional(),
    assigned_to_id: z.string().optional(),
    limit: z.number().optional().default(25),
    offset: z.number().optional().default(0),
    sort: z.string().optional()
  },
  async (params) => {
    if (!serverConfig.baseUrl || !serverConfig.apiKey) {
      return {
        content: [{ 
          type: "text", 
          text: "서버가 초기화되지 않았습니다. 먼저 'initialize' 툴을 사용하여 서버를 설정해주세요." 
        }],
        isError: true
      };
    }
    
    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      }
      
      // API 호출
      const response = await fetch(
        `${serverConfig.baseUrl}/issues.json?${queryParams.toString()}`, 
        {
          headers: {
            "X-Redmine-API-Key": serverConfig.apiKey
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`이슈 조회 실패: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 결과 반환
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `이슈 조회 중 오류 발생: ${error.message}` 
        }],
        isError: true
      };
    }
  }
);

// 특정 이슈 조회 툴
server.tool(
  "getIssue",
  "Fetches detailed information for a specific issue by ID. In addition to basic fields, it can include related data such as journals, attachments, relations, changesets, watchers, and child issues. Parameters: id, include (for related entities).",
  {
    id: z.number(),
    include: z.string().optional()
  },
  async ({ id, include }) => {
    if (!serverConfig.baseUrl || !serverConfig.apiKey) {
      return {
        content: [{ 
          type: "text", 
          text: "서버가 초기화되지 않았습니다. 먼저 'initialize' 툴을 사용하여 서버를 설정해주세요." 
        }],
        isError: true
      };
    }
    
    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      if (include) {
        queryParams.append("include", include);
      }
      
      // API 호출
      const response = await fetch(
        `${serverConfig.baseUrl}/issues/${id}.json?${queryParams.toString()}`, 
        {
          headers: {
            "X-Redmine-API-Key": serverConfig.apiKey
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`이슈 조회 실패: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 결과 반환
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `이슈 조회 중 오류 발생: ${error.message}` 
        }],
        isError: true
      };
    }
  }
);

// 프로젝트 목록 조회 툴
server.tool(
  "getProjects",
  "Lists all accessible projects with basic information like ID, name, identifier, description, status, created and updated dates. Parameters: limit, offset.",
  {
    limit: z.number().optional().default(100),
    offset: z.number().optional().default(0)
  },
  async ({ limit, offset }) => {
    if (!serverConfig.baseUrl || !serverConfig.apiKey) {
      return {
        content: [{ 
          type: "text", 
          text: "서버가 초기화되지 않았습니다. 먼저 'initialize' 툴을 사용하여 서버를 설정해주세요." 
        }],
        isError: true
      };
    }
    
    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());
      
      // API 호출
      const response = await fetch(
        `${serverConfig.baseUrl}/projects.json?${queryParams.toString()}`, 
        {
          headers: {
            "X-Redmine-API-Key": serverConfig.apiKey
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`프로젝트 조회 실패: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 결과 반환
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `프로젝트 조회 중 오류 발생: ${error.message}` 
        }],
        isError: true
      };
    }
  }
);


/*
// 상태 목록 조회 툴
server.tool(
  "getIssueStatuses",
  {},
  async () => {
    if (!serverConfig.baseUrl || !serverConfig.apiKey) {
      return {
        content: [{ 
          type: "text", 
          text: "서버가 초기화되지 않았습니다. 먼저 'initialize' 툴을 사용하여 서버를 설정해주세요." 
        }],
        isError: true
      };
    }
    
    try {
      // API 호출
      const response = await fetch(
        `${serverConfig.baseUrl}/issue_statuses.json`, 
        {
          headers: {
            "X-Redmine-API-Key": serverConfig.apiKey
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`상태 조회 실패: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 결과 반환
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `상태 조회 중 오류 발생: ${error.message}` 
        }],
        isError: true
      };
    }
  }
);

// 사용자 정보 조회 툴
server.tool(
  "getCurrentUser",
  {},
  async () => {
    if (!serverConfig.baseUrl || !serverConfig.apiKey) {
      return {
        content: [{ 
          type: "text", 
          text: "서버가 초기화되지 않았습니다. 먼저 'initialize' 툴을 사용하여 서버를 설정해주세요." 
        }],
        isError: true
      };
    }
    
    try {
      // API 호출
      const response = await fetch(
        `${serverConfig.baseUrl}/users/current.json`, 
        {
          headers: {
            "X-Redmine-API-Key": serverConfig.apiKey
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`사용자 정보 조회 실패: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 결과 반환
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `사용자 정보 조회 중 오류 발생: ${error.message}` 
        }],
        isError: true
      };
    }
  }
);
*/


// 서버 시작 즉시 실행 함수
(async () => {
  try {
    // 먼저 환경변수 기반으로 초기화 시도
    const initSuccess = await initializeServer(serverConfig.baseUrl, serverConfig.apiKey);
    
    if (!initSuccess) {
      // 자동 초기화에 실패한 경우에만 initialize 툴 노출
      server.tool(
        "initialize",
        {
          baseUrl: z.string().url(),
          apiKey: z.string()
        },
        async ({ baseUrl, apiKey }) => {
          try {
            // 제공된 파라미터로 초기화 시도
            const response = await fetch(`${baseUrl}/users/current.json`, {
              headers: {
                "X-Redmine-API-Key": apiKey
              }
            });
            
            if (!response.ok) {
              throw new Error(`API 연결 실패: ${response.status} ${response.statusText}`);
            }
            
            // 설정 업데이트
            serverConfig.baseUrl = baseUrl;
            serverConfig.apiKey = apiKey;
            
            return {
              content: [{ 
                type: "text", 
                text: `Redmine 서버(${baseUrl})에 성공적으로 연결되었습니다.` 
              }]
            };
          } catch (error) {
            return {
              content: [{ 
                type: "text", 
                text: `Redmine 서버 연결 실패: ${error.message}` 
              }],
              isError: true
            };
          }
        }
      );
    }
    
    // stdio 트랜스포트 생성 및 서버 연결
    const transport = new StdioServerTransport();
    transport.onclose = () => {
      console.error("Transport closed. Server will keep running for new connections.");
    };

    await server.connect(transport);
    console.info("서버가 성공적으로 연결되었습니다.");
    
    // 서버 상태 로깅
    console.info("Redmine MCP 서버가 시작되었습니다. stdio를 통한 통신을 기다리는 중...");
    console.error(`환경 설정: BASE_URL=${serverConfig.baseUrl ? serverConfig.baseUrl : "설정되지 않음"}, API_KEY=${serverConfig.apiKey ? "설정됨" : "설정되지 않음"}`);
    
    // 서버 프로세스 유지
    process.stdin.resume();
    
    // 프로세스 종료 처리
    process.on('SIGINT', () => {
      console.info('서버 종료 중...');
      server.close();
      process.exit(0);
    });
    
    // 예상치 못한 오류 처리
    process.on('uncaughtException', (error) => {
      console.error('예상치 못한 오류 발생:', error);
      // 심각한 오류가 발생해도 프로세스를 계속 실행
    });
    
    console.error('Redmine MCP 서버가 실행 중입니다. 종료하려면 Ctrl+C를 누르세요.');
    
  } catch (error) {
    console.error("서버 시작 중 오류 발생:", error.message);
  }
})();
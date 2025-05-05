import { mkdir, copyFile, writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

async function build() {
  try {
    console.log('Redmine MCP 서버 빌드 중...');
    
    // dist 디렉토리 생성
    await mkdir('dist', { recursive: true });
    
    // server.js를 dist로 복사
    await copyFile('server.js', join('dist', 'server.js'));
    
    // package.json 읽기
    const packageJsonContent = await fs.promises.readFile('package.json', 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // 배포용 간소화된 package.json 생성
    const distPackageJson = {
      name: packageJson.name || "redmine-mcp-server",
      version: packageJson.version || "1.0.0",
      description: packageJson.description || "Redmine MCP 서버 STDIO 모드",
      main: 'server.js',
      type: 'module',
      scripts: {
        start: 'node server.js'
      },
      dependencies: packageJson.dependencies
    };
    
    // 간소화된 package.json을 dist에 작성
    await writeFile(
      join('dist', 'package.json'), 
      JSON.stringify(distPackageJson, null, 2)
    );
    
    // dist에 README.md 생성
    const readmeContent = `# Redmine MCP 서버 (STDIO 모드)

STDIO를 통해 사용하는 Redmine API 통합 MCP 서버입니다.

## 설치 방법

1. Node.js 18 이상이 설치되어 있는지 확인하세요.
2. 이 디렉토리에서 다음 명령을 실행하여 의존성을 설치하세요:
   \`\`\`
   npm install
   \`\`\`

## 사용법

1. 환경 변수 설정 (선택 사항):
   \`\`\`
   # Windows
   set REDMINE_BASE_URL=https://your-redmine-instance.com
   set REDMINE_API_KEY=your-api-key-here

   # Linux/Mac
   export REDMINE_BASE_URL=https://your-redmine-instance.com
   export REDMINE_API_KEY=your-api-key-here
   \`\`\`

2. 서버 실행:
   \`\`\`
   node server.js
   \`\`\`

3. 또는, 환경 변수가 설정되지 않은 경우 MCP 클라이언트에서 'initialize' 도구를 사용하여 초기화하세요.

## Claude 설정 예시

Claude에서 사용할 때는 다음과 같이 MCP 서버를 설정하세요:

\`\`\`json
{
  "mcpServers": {
    "redmine": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "REDMINE_BASE_URL": "your-redmine-url",
        "REDMINE_API_KEY": "your-api-key"
      }
    }
  }
}
\`\`\`
`;
    
    await writeFile(join('dist', 'README.md'), readmeContent);
    
    // 의존성 목록 파일 생성
    await writeFile(
      join('dist', 'dependencies.txt'),
      Object.entries(packageJson.dependencies)
        .map(([name, version]) => `${name}@${version}`)
        .join('\n')
    );
    
    // .env.example 파일 생성
    const envExampleContent = `# Redmine API 설정
REDMINE_BASE_URL=https://your-redmine-instance.com
REDMINE_API_KEY=your-api-key-here
`;
    
    await writeFile(join('dist', '.env.example'), envExampleContent);
    
    console.log('빌드가 성공적으로 완료되었습니다!');
    console.log('dist 디렉토리의 내용을 사용 환경에 복사하고 npm install로 의존성을 설치한 후 사용하세요.');
  } catch (error) {
    console.error('빌드 실패:', error);
    process.exit(1);
  }
}

build();
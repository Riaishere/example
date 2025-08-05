const https = require('https');
const dns = require('dns');
const { promisify } = require('util');

const resolve4 = promisify(dns.resolve4);

async function checkDomain(domain) {
  console.log(`🔍 检查域名: ${domain}`);
  
  try {
    // 检查DNS解析
    const addresses = await resolve4(domain);
    console.log(`✅ DNS解析成功: ${addresses.join(', ')}`);
    
    // 检查HTTPS证书
    await checkCertificate(domain);
    
  } catch (error) {
    console.log(`❌ DNS解析失败: ${error.message}`);
  }
}

function checkCertificate(domain) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: domain,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      
      if (cert && cert.subject) {
        console.log(`✅ SSL证书有效`);
        console.log(`   颁发给: ${cert.subject.CN || cert.subject.O}`);
        console.log(`   颁发者: ${cert.issuer.CN || cert.issuer.O}`);
        console.log(`   有效期: ${cert.valid_from} 至 ${cert.valid_to}`);
      } else {
        console.log(`⚠️  无法获取证书信息`);
      }
      
      resolve();
    });

    req.on('error', (error) => {
      console.log(`❌ HTTPS连接失败: ${error.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ 连接超时`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// 检查您的域名
checkDomain('www.galahad.website'); 
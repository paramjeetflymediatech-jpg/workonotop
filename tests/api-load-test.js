// tests/api-load-test.js
async function testAPI() {
  console.log('🚀 Starting API Load Test...\n')
  
  // Pehle check karo server chal raha hai ya nahi
  try {
    const healthCheck = await fetch('http://localhost:3000/api/admin/providers', {
      method: 'HEAD'
    })
    console.log('✅ Server is running on port 3000\n')
  } catch(error) {
    console.log('❌ Server is NOT running!')
    console.log('\n🔧 Fix:')
    console.log('1. Open NEW terminal')
    console.log('2. Go to: cd D:\\workontap2\\workonotop')
    console.log('3. Run: npm run dev')
    console.log('4. Wait for "ready - started server"')
    console.log('5. Then run this test again\n')
    return
  }
  
  const endpoints = [
    'http://localhost:3000/api/admin/providers',
    'http://localhost:3000/api/bookings',
    'http://localhost:3000/api/customers'
  ]
  
  const results = {
    total: 0,
    success: 0,
    failed: 0,
    times: []
  }
  
  // 20 concurrent requests
  const concurrency = 20
  console.log(`📡 Sending ${concurrency} concurrent requests...`)
  
  const promises = []
  const startTime = Date.now()
  
  for(let i = 0; i < concurrency; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
    const reqStart = Date.now()
    
    promises.push(
      fetch(endpoint)
        .then(async res => {
          const time = Date.now() - reqStart
          const data = await res.json().catch(() => ({}))
          return {
            status: res.status,
            time,
            success: res.ok,
            endpoint
          }
        })
        .catch(err => ({
          status: 500,
          error: err.message,
          success: false,
          endpoint
        }))
    )
  }
  
  const responses = await Promise.all(promises)
  const totalTime = Date.now() - startTime
  
  // Analyze results
  responses.forEach(r => {
    results.total++
    if (r.success) {
      results.success++
      results.times.push(r.time)
    } else {
      results.failed++
    }
  })
  
  // Calculate stats
  const avgTime = results.times.length > 0 
    ? results.times.reduce((a, b) => a + b, 0) / results.times.length 
    : 0
  
  const maxTime = results.times.length > 0 
    ? Math.max(...results.times) 
    : 0
  
  const minTime = results.times.length > 0 
    ? Math.min(...results.times) 
    : 0
  
  console.log('\n📊 Results:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Successful: ${results.success}/${results.total}`)
  console.log(`❌ Failed: ${results.failed}/${results.total}`)
  console.log(`⏱️  Average response: ${avgTime.toFixed(2)}ms`)
  console.log(`⚡ Fastest: ${minTime}ms`)
  console.log(`🐢 Slowest: ${maxTime}ms`)
  console.log(`⏲️  Total time: ${totalTime}ms`)
  console.log(`📈 Success rate: ${((results.success/results.total)*100).toFixed(1)}%`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Per endpoint breakdown
  const endpointStats = {}
  responses.forEach(r => {
    if (!endpointStats[r.endpoint]) {
      endpointStats[r.endpoint] = { total: 0, success: 0, times: [] }
    }
    endpointStats[r.endpoint].total++
    if (r.success) {
      endpointStats[r.endpoint].success++
      endpointStats[r.endpoint].times.push(r.time)
    }
  })
  
  console.log('\n📊 Per Endpoint:')
  for (const [endpoint, stat] of Object.entries(endpointStats)) {
    const avg = stat.times.length > 0 
      ? stat.times.reduce((a, b) => a + b, 0) / stat.times.length 
      : 0
    const successRate = (stat.success / stat.total * 100).toFixed(1)
    console.log(`📌 ${endpoint}: ${stat.success}/${stat.total} (${successRate}%) - ${avg.toFixed(0)}ms avg`)
  }
  
  if (results.failed === 0) {
    console.log('\n🎉 API LOAD TEST PASSED! Server stable.')
  } else {
    console.log('\n⚠️  Some requests failed. Check server.')
    if (results.failed === results.total) {
      console.log('\n🔍 Possible issues:')
      console.log('1. Server not running? Check terminal 1')
      console.log('2. Wrong port? Server might be on different port')
      console.log('3. API routes not implemented? Check if endpoints exist')
    }
  }
}

// Run the test
testAPI()
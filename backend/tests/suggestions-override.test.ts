/// <reference types="node" />

/**
 * Suggestions, Notifications, and Admin Override Test Suite
 */

export {};

const BASE_URL = "http://127.0.0.1:5000/api";

async function runTests() {
  console.log("🚀 Starting Suggestions, Notifications & Override Tests...");

  const testEmail = `sugg_author_${Date.now()}@test.com`;
  const testPassword = "Password123!";
  const testName = "Suggestion Author";

  let authorToken = "";
  let authorId = "";
  let adminToken = "";
  let suggestionId = "";
  let journalId = "";
  let submissionId = "";

  // 1. Get UJGSM Journal Id
  try {
    const journalRes = await fetch(`${BASE_URL}/public/journals`);
    const journals = await journalRes.json();
    if (journals.success && journals.data && journals.data.length > 0) {
      const ujgsm = journals.data.find((j: any) => j.slug === "ujgsm");
      journalId = ujgsm ? ujgsm.id : journals.data[0].id;
      console.log(`✓ Found journal for tests: ${journalId}`);
    } else {
      console.error("❌ No journals found.");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Failed to query journals.", err);
    process.exit(1);
  }

  // 2. Register Author
  console.log("\n--- Test 1: Register Author ---");
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
      role: "AUTHOR",
    })
  });
  const regData = await regRes.json();
  if (regRes.status === 201 && regData.success) {
    authorToken = regData.data.token;
    authorId = regData.data.user.id;
    console.log("✓ Author registered successfully!");
  } else {
    console.error("❌ Author registration failed:", regData);
    process.exit(1);
  }

  // 3. Login Admin
  console.log("\n--- Test 2: Login Admin ---");
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@uora.com",
      password: "Admin@123",
    })
  });
  const adminData = await adminRes.json();
  if (adminRes.status === 200 && adminData.success) {
    adminToken = adminData.data.token;
    console.log("✓ Admin logged in successfully!");
  } else {
    console.error("❌ Admin login failed:", adminData);
    process.exit(1);
  }

  // 4. Submit Journal Suggestion
  console.log("\n--- Test 3: Submit Journal Suggestion ---");
  const suggRes = await fetch(`${BASE_URL}/journals-suggestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authorToken}`
    },
    body: JSON.stringify({
      title: "Universal Journal of Blockchain Technologies",
      subjectDomain: "Computer Science & Cryptography",
      description: "A journal for blockchain and web3 technology research.",
      reason: "Rising academic focus on decentralized architectures.",
      supportingInfo: "Expected 20-30 submissions per issue."
    })
  });
  const suggData = await suggRes.json();
  if (suggRes.status === 201 && suggData.success) {
    suggestionId = suggData.data.id;
    console.log(`✓ Journal suggestion submitted! ID: ${suggestionId}`);
  } else {
    console.error("❌ Suggestion submission failed:", suggData);
    process.exit(1);
  }

  // 5. Admin fetches suggestions and evaluates it to UNDER_EDITOR_REVIEW
  console.log("\n--- Test 4: Evaluate Suggestion (Editor Role) ---");
  const evalRes = await fetch(`${BASE_URL}/journals-suggestions/${suggestionId}/evaluate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: "UNDER_EDITOR_REVIEW",
      remarks: "Checking scope and board members."
    })
  });
  const evalData = await evalRes.json();
  if (evalRes.status === 200 && evalData.success) {
    console.log("✓ Suggestion transitioned to UNDER_EDITOR_REVIEW!");
  } else {
    console.error("❌ Evaluation failed:", evalData);
    process.exit(1);
  }

  // 6. Admin makes final decision to APPROVE
  console.log("\n--- Test 5: Approve Suggestion (Admin Role) ---");
  const decRes = await fetch(`${BASE_URL}/journals-suggestions/${suggestionId}/decision`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: "APPROVED",
      remarks: "Excellent proposal. Approved for the 2027 catalog."
    })
  });
  const decData = await decRes.json();
  if (decRes.status === 200 && decData.success) {
    console.log("✓ Suggestion APPROVED successfully!");
  } else {
    console.error("❌ Approval decision failed:", decData);
    process.exit(1);
  }

  // 7. Author fetches notifications
  console.log("\n--- Test 6: Retrieve Notifications ---");
  const notRes = await fetch(`${BASE_URL}/notifications`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${authorToken}`
    }
  });
  const notData = await notRes.json();
  if (notRes.status === 200 && notData.success) {
    console.log(`✓ Notifications fetched! Count: ${notData.data.length}`);
    const latestNotif = notData.data[0];
    console.log(`  Latest alert: "${latestNotif.title}" - ${latestNotif.message}`);

    // Mark it as read
    const readRes = await fetch(`${BASE_URL}/notifications/${latestNotif.id}/read`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${authorToken}`
      }
    });
    const readData = await readRes.json();
    if (readRes.status === 200 && readData.success) {
      console.log("✓ Notification marked as read!");
    } else {
      console.error("❌ Failed to mark as read:", readData);
    }
  } else {
    console.error("❌ Failed to fetch notifications:", notData);
    process.exit(1);
  }

  // 8. Test Admin Override route (Create manuscript, verify override rejects or accepts)
  console.log("\n--- Test 7: Create Manuscript for Override ---");
  const subRes = await fetch(`${BASE_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authorToken}`
    },
    body: JSON.stringify({
      journalId,
      title: "Sustainable Green Power Systems in Rural Districts",
      abstract: "This paper presents eco-friendly micro-grid solutions.",
      correspondingEmail: testEmail,
      status: "SUBMITTED"
    })
  });
  const subData = await subRes.json();
  if (subRes.status === 201 && subData.success) {
    submissionId = subData.data.id;
    console.log(`✓ Manuscript created! ID: ${submissionId}`);
  } else {
    console.error("❌ Manuscript creation failed:", subData);
    process.exit(1);
  }

  console.log("\n--- Test 8: Admin Override (Allowed even without reviewer assigned) ---");
  const overrideRes = await fetch(`${BASE_URL}/submissions/${submissionId}/override`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: "PUBLISHED",
      remarks: "Forcing publication override"
    })
  });
  const overrideData = await overrideRes.json();
  if (overrideRes.status === 200 && overrideData.success) {
    console.log("✓ Override allowed without a reviewer assigned:", overrideData.message);
  } else {
    console.error("❌ Override should have succeeded but got:", overrideRes.status, overrideData);
    process.exit(1);
  }

  console.log("\n🎉 Suggestions, Notifications & Override Tests Completed Successfully!");
}

runTests();

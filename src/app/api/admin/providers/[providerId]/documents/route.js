// app/api/admin/providers/[providerId]/documents/route.js
import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

// 🔴 FIX: Sirf ye do exports hone chahiye, kuch aur nahi
export async function GET(request, { params }) {
  try {
    // ✅ FIX: Await the params
    const { providerId } = await params;

    console.log('📄 Fetching documents for provider:', providerId);

    // Get provider details
    const providers = await execute(
      `SELECT id, name, email, phone, specialty, experience_years, city, bio,
              documents_uploaded, documents_verified, status, created_at,
              stripe_account_id, stripe_onboarding_complete
       FROM service_providers WHERE id = ?`,
      [providerId]
    );

    if (!providers || providers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get all documents
    const documents = await execute(
      `SELECT * FROM provider_documents WHERE provider_id = ? ORDER BY created_at DESC`,
      [providerId]
    );

    // Get bank account info
    const bankAccounts = await execute(
      `SELECT * FROM provider_bank_accounts WHERE provider_id = ?`,
      [providerId]
    );

    return NextResponse.json({
      success: true,
      provider: providers[0],
      documents: documents || [],
      bankAccount: bankAccounts && bankAccounts[0] ? bankAccounts[0] : null
    });

  } catch (error) {
    console.error('❌ Error in GET:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    // ✅ FIX: Await the params
    const { providerId } = await params;
    const { action, documentId, rejectionReason } = await request.json();

    console.log('📝 Document action:', { action, documentId, providerId });

    if (!providerId || !action || !documentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'approve_document') {
      // Approve document
      await execute(
        `UPDATE provider_documents 
         SET status = 'approved', is_verified = 1, reviewed_at = NOW() 
         WHERE id = ?`,
        [documentId]
      );
      console.log('✅ Document approved:', documentId);

      // Check if all required docs are approved
      const requiredDocs = ['profile_photo', 'id_proof', 'insurance'];
      const approved = await execute(
        `SELECT document_type FROM provider_documents 
         WHERE provider_id = ? AND document_type IN (?,?,?) AND status = 'approved'`,
        [providerId, ...requiredDocs]
      );

      const approvedTypes = approved && approved.length > 0 
        ? approved.map(d => d.document_type) 
        : [];
      
      const allApproved = requiredDocs.every(t => approvedTypes.includes(t));

      if (allApproved) {
        await execute(
          `UPDATE service_providers SET documents_verified = 1, updated_at = NOW() WHERE id = ?`,
          [providerId]
        );
        console.log('✅ All required docs approved for provider:', providerId);
      }

    } else if (action === 'reject_document') {
      if (!rejectionReason) {
        return NextResponse.json(
          { success: false, message: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      // Reject document
      await execute(
        `UPDATE provider_documents 
         SET status = 'rejected', rejection_reason = ?, reviewed_at = NOW() 
         WHERE id = ?`,
        [rejectionReason, documentId]
      );
      console.log('✅ Document rejected:', documentId, 'Reason:', rejectionReason);

      await execute(
        `UPDATE service_providers SET documents_verified = 0, updated_at = NOW() WHERE id = ?`,
        [providerId]
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Document ${action === 'approve_document' ? 'approved' : 'rejected'} successfully` 
    });

  } catch (error) {
    console.error('❌ Error in POST:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
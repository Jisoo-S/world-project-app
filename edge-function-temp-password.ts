// Edge Function으로 배포할 코드
// supabase/functions/send-temp-password/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    
    if (!email) {
      throw new Error('Email is required')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 사용자 확인
    const { data: users, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !users) {
      throw new Error('사용자를 찾을 수 없습니다.')
    }

    // 임시 비밀번호 생성 (8자리 랜덤 문자열)
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase()

    // 사용자 비밀번호 업데이트
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      users.id,
      { password: tempPassword }
    )

    if (updateError) throw updateError

    // 이메일 발송 (Resend API 사용 예시)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'World Travel <noreply@yourdomain.com>',
          to: email,
          subject: '임시 비밀번호 안내',
          html: `
            <h2>임시 비밀번호가 발급되었습니다</h2>
            <p>안녕하세요,</p>
            <p>요청하신 임시 비밀번호입니다:</p>
            <p style="font-size: 20px; font-weight: bold; color: #2563eb; padding: 10px; background: #f3f4f6; border-radius: 5px;">
              ${tempPassword}
            </p>
            <p>보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요.</p>
            <p>감사합니다.</p>
          `
        })
      })

      if (!emailResponse.ok) {
        console.error('Email send failed:', await emailResponse.text())
      }
    }

    return new Response(
      JSON.stringify({ 
        message: '임시 비밀번호가 이메일로 전송되었습니다.',
        // 개발 환경에서만 임시 비밀번호 반환 (프로덕션에서는 제거)
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { tempPassword })
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

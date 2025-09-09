import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { fullName, email, subject, message } = await request.json()

    console.log('Contact form submission received:', { fullName, email, subject, messageLength: message?.length })

    // Validation
    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (fullName.length < 6) {
      return NextResponse.json(
        { error: 'Full name must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Log the complete message details that would be sent to kathanchauhan22@gmail.com
    console.log('=== EMAIL THAT WOULD BE SENT ===')
    console.log('To: kathanchauhan22@gmail.com')
    console.log('From: Arisze Contact Form')
    console.log('Subject:', subject)
    console.log('Sender Name:', fullName)
    console.log('Sender Email:', email)
    console.log('Message:', message)
    console.log('=== END EMAIL ===')

    // For now, return success since we're logging the details
    // To actually send emails:
    // 1. Go to https://resend.com and create an account
    // 2. Generate an API key
    // 3. Add RESEND_API_KEY=your_actual_key to .env.local
    // 4. Uncomment the Resend code below

    /*
    // Uncomment this section when you have a real Resend API key
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'Arisze Contact <onboarding@resend.dev>',
      to: ['kathanchauhan22@gmail.com'],
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
    */

    return NextResponse.json({
      message: 'Message sent successfully! Check server logs for details.',
      id: 'logged-' + Date.now(),
      note: 'Email details have been logged to server console'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
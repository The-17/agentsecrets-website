import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.agentsecrets.theseventeen.co/telemetry/metrics/', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying metrics:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

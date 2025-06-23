// components/ascii-header.tsx
'use client'

// Split the ASCII art into two lines
const TITLE_LINE_1 = `
░██████╗███╗░░░███╗░█████╗░██████╗░████████╗
██╔════╝████╗░████║██╔══██╗██╔══██╗╚══██╔══╝
╚█████╗░██╔████╔██║███████║██████╔╝░░░██║░░░
░╚═══██╗██║╚██╔╝██║██╔══██║██╔══██╗░░░██║░░░
██████╔╝██║░╚═╝░██║██║░░██║██║░░██║░░░██║░░░
╚═════╝░╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░
`

const TITLE_LINE_2 = `
  ░█████╗░██╗░░░░░██╗███╗░░██╗██╗░█████╗░
  ██╔══██╗██║░░░░░██║████╗░██║██║██╔══██╗
  ██║░░╚═╝██║░░░░░██║██╔██╗██║██║██║░░╚═╝
  ██║░░██╗██║░░░░░██║██║╚████║██║██║░░██╗
  ╚█████╔╝███████╗██║██║░╚███║██║╚█████╔╝
  ░╚════╝░╚══════╝╚═╝╚═╝░░╚══╝╚═╝░╚════╝░
`

export default function AsciiHeader() {
	return (
		<figure className="max-w-full overflow-hidden flex flex-col items-center justify-center">
			{' '}
			{/* Added flex layout for centering */}
			<figcaption className="sr-only">Smart Clinic ASCII art title</figcaption>
			<pre className="select-none whitespace-pre-wrap text-center font-mono text-base leading-normal text-gray-800 dark:text-gray-200">
				{TITLE_LINE_1}
			</pre>
			<pre className="select-none whitespace-pre-wrap text-center font-mono text-base leading-normal text-gray-800 dark:text-gray-200">
				{TITLE_LINE_2}
			</pre>
		</figure>
	)
}

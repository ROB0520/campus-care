import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components';

interface ResetTokenEmailProps {
	resetLink?: string;
}

const baseUrl = process.env?.AUTH_URL || ''

export default function ResetTokenEmail({
	resetLink,
}: ResetTokenEmailProps) {
	return (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>Log in with this magic link.</Preview>
			<Container style={container}>
				<Img
					src={`${baseUrl}/logo.svg`}
					width={48}
					height={48}
					alt="Campus Care Logo"
				/>
				<Heading style={heading}>🪄 Your magic link</Heading>
				<Section style={body}>
					<Text style={paragraph}>
						<Link style={link} href={resetLink}>
							👉 Click here to reset your password 👈
						</Link>
					</Text>
					<Text style={paragraph}>
						If you didn&apos;t request this, please ignore this email.
					</Text>
				</Section>
				<Text style={paragraph}>
					Best,
					<br />- Campus Care
				</Text>
				<Hr style={hr} />
				<Img
					src={`${baseUrl}/logo.svg`}
					width={32}
					height={32}
					style={{
						WebkitFilter: 'grayscale(100%)',
						filter: 'grayscale(100%)',
						margin: '20px 0',
					}}
				/>
				<Text style={footer}>Luhkey9 Group</Text>
			</Container>
		</Body>
	</Html>
)};

const main = {
	backgroundColor: '#ffffff',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: '0 auto',
	padding: '20px 25px 48px',
	backgroundImage: 'url("/email-bg.png")',
	backgroundPosition: 'bottom',
	backgroundRepeat: 'no-repeat, no-repeat',
};

const heading = {
	fontSize: '28px',
	fontWeight: 'bold',
	marginTop: '48px',
};

const body = {
	margin: '24px 0',
};

const paragraph = {
	fontSize: '16px',
	lineHeight: '26px',
};

const link = {
	color: '#3d63dd',
};

const hr = {
	borderColor: '#dddddd',
	marginTop: '48px',
};

const footer = {
	color: '#8898aa',
	fontSize: '12px',
	marginLeft: '4px',
};

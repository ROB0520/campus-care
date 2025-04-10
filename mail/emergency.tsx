import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Preview,
	Section,
	Text,
} from '@react-email/components';

interface EmergencyEmailProps {
	studentName: string;
}

const baseUrl = process.env?.AUTH_URL || ''

export default function EmergencyEmail({
	studentName
}: EmergencyEmailProps) {
	return (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>
				Emergency alert regarding {studentName}
			</Preview>
			<Container style={container}>
				<Img
					src={`${baseUrl}/logo.svg`}
					width={48}
					height={48}
					alt="Campus Care Logo"
				/>
				<Heading style={heading}>
					🚨 Emergency alert regarding {studentName}
				</Heading>
				<Section style={body}>
					<Text style={paragraph}>
						We have received an emergency alert regarding <strong>{studentName}</strong>. Please take immediate action and proceed to the clinic as soon as possible.
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
	backgroundImage: `url("${baseUrl}/email-bg.png")`,
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

const hr = {
	borderColor: '#dddddd',
	marginTop: '48px',
};

const footer = {
	color: '#8898aa',
	fontSize: '12px',
	marginLeft: '4px',
};

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
import moment from 'moment-timezone';

interface AppointmentCancelledEmailProps {
	timestamp: number;
}

const baseUrl = process.env?.AUTH_URL || ''

export default function AppointmentCancelledEmail({
	timestamp,
}: AppointmentCancelledEmailProps) {
	return (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>
				Your appointment has been cancelled!
			</Preview>
			<Container style={container}>
				<Img
					src={`${baseUrl}/logo.svg`}
					width={48}
					height={48}
					alt="Campus Care Logo"
				/>
				<Heading style={heading}>
					❌ Your appointment has been cancelled!
				</Heading>
				<Section style={body}>
					<Text style={paragraph}>
						Your appointment scheduled for {moment.unix(timestamp).format('MMMM Do YYYY, h:mm A')} has been cancelled.
					</Text>
					<Text style={paragraph}>
						If you don&nbsp;t recognize this appointment, please ignore this email. If you want to book a new appointment, please do so in <Link style={link} href={`${baseUrl}`}>the website</Link>.
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

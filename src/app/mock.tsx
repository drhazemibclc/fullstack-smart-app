import { Clock, ShoppingBag, Star, Truck } from 'lucide-react'

export const featuresWhyChooseUs = [
	{
		description:
			'We provide free consultations for first-time patients. Experience our quality care without any initial cost.',
		icon: <Truck className="h-6 w-6 text-primary" />,
		title: 'Free Initial Consultation',
	},
	{
		description:
			"Your child's health information is always safe and secure with us. We use industry-leading encryption to protect your data.",
		icon: <ShoppingBag className="h-6 w-6 text-primary" />,
		title: 'Secure Patient Data',
	},
	{
		description:
			"Our pediatric specialists are available 24/7 to address any concerns or questions you may have about your child's health.",
		icon: <Clock className="h-6 w-6 text-primary" />,
		title: '24/7 Pediatric Support',
	},
	{
		description:
			"We stand behind the quality of our care. If you're not satisfied, we offer a 30-day satisfaction guarantee.",
		icon: <Star className="h-6 w-6 text-primary" />,
		title: 'Quality Care Guarantee',
	},
]
interface ClinicService {
	title: string
	description: string
	icon: React.ReactNode
	link: string
}

// Define the five requested services
export const clinicServices: ClinicService[] = [
	{
		title: 'Pediatric Checkup',
		description: "Regular health checkups to monitor your child's well-being.",
		icon: <span className="text-2xl">🩺</span>,
		link: '/services/pediatric-checkup',
	},
	{
		title: 'Vaccinations',
		description: 'Keep your child protected with timely immunizations.',
		icon: <span className="text-2xl">💉</span>,
		link: '/services/vaccinations',
	},
	{
		title: 'Growth and Development Tracking',
		description: 'Track milestones and ensure healthy development.',
		icon: <span className="text-2xl">📈</span>,
		link: '/services/growth-tracking',
	},
	{
		title: 'Lactation Consultant',
		description: 'Expert support for breastfeeding and nutrition.',
		icon: <span className="text-2xl">🤱</span>,
		link: '/services/lactation-consultant',
	},
	{
		title: 'Gynecology and Obstetrics',
		description: "Comprehensive care for women's health and pregnancy.",
		icon: <span className="text-2xl">👩‍⚕️</span>,
		link: '/services/gynecology-obstetrics',
	},
]

// Patient Testimonials
export const patientTestimonials = [
	{
		name: 'Sarah M.',
		message:
			'The pediatricians at Smart Clinic are wonderful! My son actually looks forward to his checkups. The staff is friendly and the environment is very welcoming for kids.',
		avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
		relation: 'Mother of 3-year-old patient',
	},
	{
		name: 'Ahmed R.',
		message:
			"We were nervous about our daughter's vaccinations, but the nurses explained everything and made her feel at ease. Highly recommended!",
		avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
		relation: 'Father of 1-year-old patient',
	},
	{
		name: 'Priya K.',
		message:
			'The lactation consultant was so helpful and supportive during the early weeks after delivery. I felt empowered and cared for.',
		avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
		relation: 'New mother',
	},
	{
		name: 'Fatima S.',
		message:
			'I appreciate the thorough growth tracking and advice I receive at every visit. The doctors take time to answer all my questions.',
		avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
		relation: 'Mother of 2 children',
	},
	{
		name: 'Mona G.',
		message:
			'As a first-time mom, I found the gynecology and obstetrics care at Smart Clinic to be outstanding. The doctors are knowledgeable and compassionate.',
		avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
		relation: 'First-time mother',
	},
]

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// await prisma.user.create({
	// 	data: {
	// 		name: "Alice",
	// 		email: "alice@prisma.io",
	// 		password: "randompassword",
	// 		posts: {
	// 			create: {
	// 				title: "What is Lorem Ipsum?",
	// 				content:
	// 					"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
	// 			},
	// 		},
	// 	},
	// });
	const allUsers = await prisma.user.findMany();
	console.log(allUsers);
}

main()
	.catch((e) => {
		throw e;
	})

	.finally(async () => {
		await prisma.$disconnect();
	});

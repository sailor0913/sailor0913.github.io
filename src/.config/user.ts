import type { Config } from "~/types";

export const configUser: Partial<Config> = {
	// Override the default config here
	title: "热爱生活",
	author: "sailor0913",
	desc: "热爱生活，享受生活",
	website: "https://lovehxy.com",
	locale: "zh-cn",
	themeStyle: "light",
	socials: [
		{
			name: "github",
			href: "https://github.com/sailor0913",
		},
		// {
		// 	name: "rss",
		// 	href: "/atom.xml",
		// },
		{
			name: "twitter",
			href: "https://x.com/juventusryp",
		},
		{
			name: "alpha-b-box",
			href: "https://space.bilibili.com/479305033",
		},
	],
	header: {
		twitter: "@juventusryp",
	},
	navs: [
		{
			name: "Posts",
			href: "/posts/page/1",
		},
		{
			name: "Archive",
			href: "/archive",
		},
		{
			name: "Categories",
			href: "/categories",
		},
		{
			name: "About",
			href: "/about",
		},
	],
	category_map: [{ name: "胡适", path: "hu-shi" }],
	comments: {},
};

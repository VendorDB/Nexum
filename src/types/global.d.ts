// Copyright (C) 2023 Marcus Huber (xenorio) <dev@xenorio.xyz>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


export { }

declare global {

	interface User {
		_id: string;
		username: string;
		email: string;
		emailVerified: boolean;
		verificationCode: string;
		passwordHash: string;
		admin: boolean;
		reputation: number;
		recoveryCode?: string;
		profile_picture: string;
		about: string;
	}

	interface Review {
		stars: number;
		message: string;
		attachments: Attachment[];
		created: number;
		author: {
			username: string;
			id: string;
		}
	}

	interface Attachment {
		data: string;
	}

	interface Vendor {
		_id: string;
		name: string;
		url: string;
		logo: string;
		description: string;
		reviews: Review[];
		owner: string;
		stars: number;
		starsAverage: number;
		products?: Product[];
		shipping?: ShippingList
	}

	interface Product {
		type: 'substance' | 'accessory' | 'merch' | 'other';
		name: string;
		description?: string;
		url: string;
		wiki?: string;
		shipping?: ShippingList
	}

	interface ShippingList {
		blacklist?: string[],
		whitelist?: string[]
	}

}

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
		perms: number;
		reputation: number;
		recoveryCode?: string;
		profile_picture: string;
		about: string;
		lastReviewPosted: number;
		totpEnabled?: boolean;
		totpSecret?: string;
	}

	interface Review {
		_id?: string;
		stars: number;
		message: string;
		attachments: Attachment[];
		created: number;
		author: {
			_id: string;
			username: string;
		}
		isHeld: boolean;
		vendor: string;
		likes: string[];
		likeAmount: number;
		reported: boolean;
	}

	interface Country {
		label: string;
		value: string;
		flag: string;
		name: string;
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
		owner: string;
		stars: number;
		reviewAmount: number;
		averageRating: number;
		products?: Product[];
		shipping?: ShippingList;
		country?: Country;
	}

	interface VendorRequest {
		name: string;
		url: string;
		author: {
			_id: string;
			username: string;
		}
		created: number;
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

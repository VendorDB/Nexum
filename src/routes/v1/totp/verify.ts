// Copyright (C) 2024 Marcus Huber (xenorio) <dev@xenorio.xyz>
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

import { Handler } from 'express'
import authenticator from 'otpauth'

export const post: Handler = async (req, res) => {

	const secret = req.body.secret
	const token = req.body.token

	if (!secret || !token) return res.status(403).json({
		status: 'ERROR',
		error: 'MISSING_INFO',
		message: 'Missing secret or token'
	})

	const totp = new authenticator.TOTP({
		algorithm: 'SHA1',
		digits: 6,
		period: 30,
		secret
	})

	const valid = totp.validate({token, window: 1}) != null

	res.json({
		status: 'SUCCESS',
		valid: valid
	})

}
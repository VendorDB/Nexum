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

import config from 'config'
import jwt, {SignOptions} from 'jsonwebtoken'

export const verifyUsername = (username: string) => {
	if (
		username.includes(' ') || // No spaces
		username.length > 16 || // Max 16 characters
		!/^[\x00-\x7F]*$/.test(username) // ASCII only
	) {
		return false
	}
	return true
}

export const verifyPassword = (password: string) => {
	if (
		password.includes(' ') || // No spaces
		password.length < 8 || // Min 8 characters
		!/^[\x00-\x7F]*$/.test(password) // ASCII only (we could allow unicode here, but want to prevent users from having to do copy&paste shenanigans)
	) {
		return false
	}
	return true
}

export const generateJWT = (id: string, type: string, options?: SignOptions) => {
	return jwt.sign({ id, type }, <string> config.get('jwt-secret'), options)
}
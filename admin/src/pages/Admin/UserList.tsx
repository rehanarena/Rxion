import { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext'; 
import axios from 'axios';
import { UserData } from '../../Interfaces/User';
import { AdminContextType } from '../../Interfaces/AdminContext';
import { useDebounce } from '../../hooks/useDebounce';

const UserList = () => {
  const { aToken } = useContext(AdminContext) as AdminContextType;  
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);
  const backendUrl = import.meta.env.VITE_NODE_ENV === "PRODUCTION"
    ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
    : import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!aToken) {
        setError('Not Authorized. Please login.');
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get(`${backendUrl}/api/admin/users`, {
          headers: { atoken: aToken },
          params: {
            search: debouncedSearch,
            page: currentPage,
            limit: usersPerPage,
          },
        });
  
        if (Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          setTotalUsers(response.data.total);
        } else {
          setError('Received data is not in the expected format.');
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.message || 'Error fetching users.');
        } else {
          setError('Error fetching users.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [aToken, backendUrl, currentPage, usersPerPage, debouncedSearch,]);
  
  const handleBlockUnblock = async (userId: string, action: 'block' | 'unblock') => {
    try {
      if (!aToken) {
        setError('Not Authorized. Please login.');
        return;
      }
      await axios.patch(
        `${backendUrl}/api/admin/users/block-unblock/${userId}`,
        { action },
        { headers: { atoken: aToken } }
      );
      setUsers(users.map(user =>
        user._id === userId ? { ...user, isBlocked: action === 'block' } : user
      ));
    } catch (error) {
      setError('Error blocking/unblocking user.');
      console.error('Error blocking/unblocking user:', error);
    }
  };
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">User List</h1>
      
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
      </div>
      
      {loading && <p className="text-gray-500">Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {users.length === 0 && !loading ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{user.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{user.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                      ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() =>
                        handleBlockUnblock(user._id, user.isBlocked ? 'unblock' : 'block')
                      }
                      className={`px-4 py-2 rounded-full text-white font-semibold 
                        ${user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-l-lg hover:bg-blue-600 disabled:bg-gray-300"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;

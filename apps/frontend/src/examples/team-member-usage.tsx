/**
 * Example usage of the updated useTeams hook addTeamMember function
 * 
 * This demonstrates all the ways to call addTeamMember after our fix:
 */

import { useTeams, type AddTeamMemberData } from '@/hooks/useTeams';

export function ExampleTeamManagement() {
  const { addTeamMember } = useTeams();

  const handleAddMember = () => {
    const teamId = 1;

    // Method 1: Backward compatible - just Pokemon ID (auto position & no nickname)
    addTeamMember(teamId, 25);

    // Method 2: With nickname but auto position
    addTeamMember(teamId, 25, "Pikachu");

    // Method 3: With nickname and specific position
    addTeamMember(teamId, 25, "Pikachu", 1);

    // Method 4: Using data object (most flexible)
    const memberData: AddTeamMemberData = {
      pokemonId: 25,
      nickname: "Pikachu",
      position: 1
    };
    addTeamMember(teamId, memberData);

    // Method 5: Auto position with nickname using object
    const memberDataAutoPos: AddTeamMemberData = {
      pokemonId: 25,
      nickname: "Pikachu"
      // position will be auto-assigned by backend
    };
    addTeamMember(teamId, memberDataAutoPos);

    // Method 6: Just Pokemon ID using object
    const memberDataMinimal: AddTeamMemberData = {
      pokemonId: 25
      // nickname and position will be auto-handled
    };
    addTeamMember(teamId, memberDataMinimal);
  };

  return (
    <button onClick={handleAddMember}>
      Add Team Member (All Methods)
    </button>
  );
}

/**
 * API Calls that will be made:
 * 
 * 1. POST /teams/1/members { pokemonId: 25 }
 * 2. POST /teams/1/members { pokemonId: 25, nickname: "Pikachu" }
 * 3. POST /teams/1/members { pokemonId: 25, nickname: "Pikachu", position: 1 }
 * 4. POST /teams/1/members { pokemonId: 25, nickname: "Pikachu", position: 1 }
 * 5. POST /teams/1/members { pokemonId: 25, nickname: "Pikachu" }
 * 6. POST /teams/1/members { pokemonId: 25 }
 * 
 * All these will work correctly with the backend auto-assignment logic!
 */